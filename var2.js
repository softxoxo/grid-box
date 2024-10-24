document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.format-grid');
    const items = grid.querySelectorAll('.format-item');
    let lastHoveredItem = null;
    let lastHoveredColumn = null;
    let lastMouseY = null;
    let isHillEffectMode = false; 

    function getColumns(items, grid) {
        const columns = [];
        const rect = grid.getBoundingClientRect();
        const columnCount = Math.floor(rect.width / (180 + 10));

        for (let i = 0; i < columnCount; i++) {
            columns.push(Array.from(items).filter((_, index) => index % columnCount === i));
        }

        return columns;
    }

    function animateColumns() {
        const columns = getColumns(items, grid);
        const maxColumnHeight = Math.max(...columns.map(col => col.length));
        
        // Calculate total animation duration
        const lastAnimationDelay = (maxColumnHeight - 1) * 300;
        const animationDuration = 500;
        const totalDuration = lastAnimationDelay + animationDuration;
    
        // Remove shadow initially
        columns.forEach(column => {
            column.forEach(item => {
                item.removeAttribute('data-shadow');
            });
        });
    
        // Animate each item
        for (let rowIndex = 0; rowIndex < maxColumnHeight; rowIndex++) {
            columns.forEach(column => {
                const item = column[rowIndex];
                if (item) {
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(20px)';
                    
                    setTimeout(() => {
                        item.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
                        item.style.opacity = '1';
                        item.style.transform = `translateY(0) scale(1) rotateY(0deg)`;
                        
                        setTimeout(() => {
                            item.style.transition = '';
                        }, 500);
                    }, rowIndex * 300);
                }
            });
        }
    
        // Show shadow after all animations complete
        setTimeout(() => {
            columns.forEach(column => {
                column.forEach(item => {
                    item.setAttribute('data-shadow', 'true');
                });
            });
        }, totalDuration);
    }

    function getNeighbors(index, columns) {
        const neighbors = [];
        const row = Math.floor(index / columns);
        const col = index % columns;
    
        neighbors.push({ item: items[index], rowDiff: 0, colDiff: 0 });
    
        const topRow = row - 1;
        if (topRow >= 0) {
            const topIndex = topRow * columns + col;
            neighbors.push({ item: items[topIndex], rowDiff: -1, colDiff: 0 });
        }
    
        const bottomRow = row + 1;
        const bottomIndex = bottomRow * columns + col;
        if (bottomIndex < items.length) {
            neighbors.push({ item: items[bottomIndex], rowDiff: 1, colDiff: 0 });
        }
    
        return neighbors;
    }

    
    function applyHillEffect(event) {
        const target = event.target.closest('.format-item');
        if (!target) return;
    
        const rect = grid.getBoundingClientRect();
        const columns = Math.floor(rect.width / (180 + 10));
        const index = Array.from(items).indexOf(target);
        const currentColumn = index % columns;
    
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        const itemWidth = rect.width / columns;
        const itemCenterX = currentColumn * itemWidth + itemWidth / 2;
        const mouseDirection = mouseX < itemCenterX ? 'left' : 'right';
    
        const columnChanged = lastHoveredColumn !== currentColumn;
        const neighbors = getNeighbors(index, columns);

        // Reset transforms for non-neighbor items
        items.forEach(item => {
            if (!neighbors.some(n => n.item === item)) {
                const currentRotation = getRotation(item);
                item.style.transform = `translateY(0) scale(1) rotateY(${currentRotation}deg)`;
            }
            item.style.zIndex = '1';
        });

        // Handle column change
        if (columnChanged) {
            isHillEffectMode = false;  // Reset to Phase 1
            items.forEach(item => item.removeAttribute('data-neighbor'));
            // Mark new neighbors
            neighbors.forEach(({ item }) => {
                if (item !== target) {
                    item.setAttribute('data-neighbor', 'true');
                }
            });
        }

        // Check if we should switch to Phase 2
        if (!isHillEffectMode && target.hasAttribute('data-neighbor')) {
            isHillEffectMode = true;  // Switch to Phase 2
            // Remove all neighbor attributes as we don't need them anymore
            items.forEach(item => item.removeAttribute('data-neighbor'));
        }

        neighbors.forEach(({ item, rowDiff, colDiff }) => {
            let scale, rotateY;
            
            if (rowDiff === 0 && colDiff === 0) {
                // Main hovered item
                scale = 1.4;
                if (columnChanged) {
                    rotateY = mouseDirection === 'left' ? -180 : 180;
                    item.classList.toggle('flipped');
                } else {
                    rotateY = item.classList.contains('flipped') ? 180 : 0;
                }
            } else {
                // Neighbor items
                scale = isHillEffectMode ? 1.2 : 1;  // Only apply hill effect in Phase 2
                rotateY = item.classList.contains('flipped') ? 180 : 0;
            }

            item.style.transform = `translateY(0) scale(${scale}) rotateY(${rotateY}deg)`;
            item.style.zIndex = rowDiff === 0 && colDiff === 0 ? '3' : '2';
            
            updateItemContent(item, rotateY);
        });
    
        lastHoveredItem = target;
        lastHoveredColumn = currentColumn;
        lastMouseY = mouseY;
    }

    function resetHillEffect() {
        items.forEach(item => {
            const currentRotation = getRotation(item);
            item.style.transform = `translateY(0) scale(1) rotateY(${currentRotation}deg)`;
            item.style.zIndex = '1';
            item.removeAttribute('data-neighbor');
        });
        lastHoveredItem = null;
        lastHoveredColumn = null;
        isHillEffectMode = false;  // Reset to Phase 1
    }

    function getRotation(item) {
        return item.classList.contains('flipped') ? 180 : 0;
    }

    function updateItemContent(item, rotateY) {
        const originalContent = item.querySelector('.format-text');
        const flippedContent = item.querySelector('.flipped-content');

        originalContent.style.opacity = Math.abs(rotateY) === 180 ? '0' : '1';
        flippedContent.style.opacity = Math.abs(rotateY) === 180 ? '1' : '0';
    }

    function initializeGridItems() {
        items.forEach(item => {
            if (!item.querySelector('.flipped-content')) {
                const flippedContent = document.createElement('div');
                flippedContent.className = 'flipped-content';
                flippedContent.innerHTML = item.querySelector('.format-text').innerHTML;
                item.appendChild(flippedContent);
            }
        });
    }

    initializeGridItems();
    animateColumns();

    grid.addEventListener('mousemove', applyHillEffect);
    grid.addEventListener('mouseleave', resetHillEffect);
});