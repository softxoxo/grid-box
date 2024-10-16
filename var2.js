document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.format-grid');
    const items = grid.querySelectorAll('.format-item');
    let lastHoveredItem = null;

    function animateItems() {
        items.forEach((item, index) => {
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, index * 50 + 500);
        });
    }

    animateItems();

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
    
        if (lastHoveredItem === target) return;
        lastHoveredItem = target;
    
        const neighbors = getNeighbors(index, columns);
    
        const mouseX = event.clientX - rect.left;
        const itemWidth = rect.width / columns;
        const itemCenterX = (index % columns) * itemWidth + itemWidth / 2;
        const mouseDirection = mouseX < itemCenterX ? 'left' : 'right';
    
        items.forEach(item => {
            if (!neighbors.some(n => n.item === item)) {
                const currentRotation = getRotation(item);
                item.style.transform = `translateY(0) scale(1) rotateY(${currentRotation}deg)`;
            }
            item.style.zIndex = '1';
        });
    
        const isMiddleRow = neighbors.length === 3;
    
        neighbors.forEach(({ item, rowDiff, colDiff }) => {
            let scale, translateY, rotateY;
    
            if (rowDiff === 0 && colDiff === 0) {
                scale = 1.4;
                translateY = -0.01;
                if (!item.classList.contains('flipped')) {
                    rotateY = mouseDirection === 'left' ? -180 : 180;
                    item.classList.add('flipped');
                } else {
                    rotateY = 0;
                    item.classList.remove('flipped');
                }
            } else {
                scale = 1.2;
                translateY = -0.01;
                rotateY = getRotation(item);
            }

            const currentTransform = window.getComputedStyle(item).transform;
            const matrix = new DOMMatrix(currentTransform);
            const currentScale = matrix.m11;

            if (Math.abs(currentScale - 1) < 0.01 && (rowDiff === 0 && colDiff === 0)) {
                item.style.transform = `translateY(${translateY}px) scale(${scale}) rotateY(${rotateY}deg)`;
            } else {
                item.style.transform = `translateY(${translateY}px) scale(${scale})`;
            }

            item.style.zIndex = rowDiff === 0 && colDiff === 0 ? '3' : '2';

            updateItemContent(item, rotateY);
        });
    }

    function resetHillEffect() {
        items.forEach(item => {
            const currentRotation = getRotation(item);
            item.style.transform = `translateY(0) scale(1) rotateY(${currentRotation}deg)`;
            item.style.zIndex = '1';
            
            updateItemContent(item, currentRotation);
        });
        lastHoveredItem = null;
    }

    function getRotation(item) {
        const transform = item.style.transform;
        const match = transform.match(/rotateY\(([-\d.]+)deg\)/);
        return match ? parseFloat(match[1]) : 0;
    }

    function updateItemContent(item, rotateY) {
        const originalContent = item.querySelector('.format-text');
        const flippedContent = item.querySelector('.flipped-content') || createFlippedContent(item);

        originalContent.style.opacity = Math.abs(rotateY) === 180 ? '1' : '1';
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