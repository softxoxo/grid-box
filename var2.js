document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.format-grid');
    const items = grid.querySelectorAll('.format-item');
    let lastHoveredItem = null;
    let lastHoveredColumn = null;
    let lastMouseY = null;

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
        columns.forEach((column, columnIndex) => {
            column.forEach((item, itemIndex) => {
                item.style.opacity = '0';
                item.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    item.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                    
                    // Remove transition after animation
                    setTimeout(() => {
                        item.style.transition = '';
                    }, 500);
                }, columnIndex * 300 + itemIndex * 100);
            });
        });
    }

    animateColumns();

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
    
        const neighbors = getNeighbors(index, columns);
    
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        const itemWidth = rect.width / columns;
        const itemCenterX = currentColumn * itemWidth + itemWidth / 2;
        const mouseDirection = mouseX < itemCenterX ? 'left' : 'right';
    
        // Check if we've moved to a new column
        const columnChanged = lastHoveredColumn !== currentColumn;
        lastHoveredColumn = currentColumn;

        // Determine vertical movement
        const verticalMovement = lastMouseY !== null ? mouseY - lastMouseY : 0;
        const movingVertically = Math.abs(verticalMovement) > 0; // Threshold for vertical movement
    
        items.forEach(item => {
            if (!neighbors.some(n => n.item === item)) {
                const currentRotation = getRotation(item);
                item.style.transform = `translateY(0) scale(1) rotateY(${currentRotation}deg)`;
            }
            item.style.zIndex = '1';
        });
        neighbors.forEach(({ item, rowDiff, colDiff }) => {
            let scale, translateY, rotateY;
            if (rowDiff === 0 && colDiff === 0) {
                scale = 1.4;
                translateY = -0.01;
                if (columnChanged) {
                    rotateY = mouseDirection === 'left' ? -180 : 180;
                    item.classList.toggle('flipped');
                } else {
                    rotateY = item.classList.contains('flipped') ? 180 : 0;
                }
            } else {
                if (movingVertically) {
                    scale = 1.2
                    translateY =-0.01
                } else {
                    scale = 1
                    translateY = 0
                }
                rotateY = item.classList.contains('flipped') ? 180 : 0;
            }

            item.style.transform = `translateY(${translateY}px) scale(${scale}) rotateY(${rotateY}deg)`;
            item.style.zIndex = rowDiff === 0 && colDiff === 0 ? '3' : '2';

            updateItemContent(item, rotateY);
        });
    
        lastHoveredItem = target;
        lastMouseY = mouseY;
    }

    function resetHillEffect() {
        items.forEach(item => {
            const currentRotation = item.classList.contains('flipped') ? 180 : 0;
            item.style.transform = `translateY(0) scale(1) rotateY(${currentRotation}deg)`;
            item.style.zIndex = '1';
            
            updateItemContent(item, currentRotation);
        });
        lastHoveredItem = null;
        lastHoveredColumn = null;
    }

    function getRotation(item) {
        return item.classList.contains('flipped') ? 180 : 0;
    }

    function updateItemContent(item, rotateY) {
        const originalContent = item.querySelector('.format-text');
        const flippedContent = item.querySelector('.flipped-content') || createFlippedContent(item);

        originalContent.style.opacity = Math.abs(rotateY) === 180 ? '0' : '1';
        flippedContent.style.opacity = Math.abs(rotateY) === 180 ? '1' : '0';
    }

    function createFlippedContent(item) {
        const flippedContent = document.createElement('div');
        flippedContent.className = 'flipped-content';
        flippedContent.innerHTML = item.querySelector('.format-text').innerHTML;
        item.appendChild(flippedContent);
        return flippedContent;
    }

    grid.addEventListener('mousemove', applyHillEffect);
    grid.addEventListener('mouseleave', resetHillEffect);
});