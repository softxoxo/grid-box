document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.format-grid');
    const items = grid.querySelectorAll('.format-item');

    function animateItems() {
        items.forEach((item, index) => {
            item.style.transform = 'translateY(40px)';
            item.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
            
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, index * 50 + 500); // 500ms initial delay, then 50ms between each item
        });
    }

    // Start the animation
    animateItems();
    function getNeighbors(index, columns) {
        const neighbors = [];
        const row = Math.floor(index / columns);
        const col = index % columns;
    
        // Add current item
        neighbors.push({ item: items[index], rowDiff: 0, colDiff: 0 });
    
        // Check neighbor above
        const topRow = row - 1;
        if (topRow >= 0) {
            const topIndex = topRow * columns + col;
            neighbors.push({ item: items[topIndex], rowDiff: -1, colDiff: 0 });
        }
    
        // Check neighbor below
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
        const columns = Math.floor(rect.width / (180 + 10)); // item width + gap
        const index = Array.from(items).indexOf(target);

        const neighbors = getNeighbors(index, columns);

        items.forEach(item => {
            item.style.transform = 'scale(1) translate(0, 0) rotateX(0) rotateY(0)';
            item.style.zIndex = '1';
        });

        neighbors.forEach(({ item, rowDiff, colDiff }) => {
            const distance = Math.sqrt(rowDiff * rowDiff + colDiff * colDiff);
            let scale, translateY, translateX, rotateX, rotateY;

            if (distance === 0) {
                scale = 1.4;
                translateY = -10;
                translateX = 0;
                rotateX = 0;
                rotateY = 0;
            } else {
                scale = 0.8 + (0.5 / distance);
                translateY = -10 / distance;
                const lateralMove = (scale - 1) * 10;
                translateX = lateralMove * colDiff;
                translateY += lateralMove * rowDiff;
                rotateX = -15 * rowDiff;
                rotateY = 15 * colDiff;
            }

            item.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            item.style.zIndex = Math.floor(10 - distance);
        });
    }

    function resetHillEffect() {
        items.forEach(item => {
            item.style.transform = 'scale(1) translate(0, 0) rotateX(0) rotateY(0)';
            item.style.zIndex = '1';
        });
    }

    grid.addEventListener('mousemove', applyHillEffect);
    grid.addEventListener('mouseleave', resetHillEffect);
});