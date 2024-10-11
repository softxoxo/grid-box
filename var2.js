// CSS remains the same as before

document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.format-grid');
    const items = grid.querySelectorAll('.format-item');

    function getNeighbors(index, columns) {
        const neighbors = [];
        const row = Math.floor(index / columns);
        const col = index % columns;

        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const newRow = row + i;
                const newCol = col + j;
                const newIndex = newRow * columns + newCol;

                if (newRow >= 0 && newCol >= 0 && newCol < columns && newIndex < items.length) {
                    neighbors.push({ item: items[newIndex], rowDiff: i, colDiff: j });
                }
            }
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
                // Calculate lateral movement to prevent overlap
                const lateralMove = (scale - 1) * 10; // 90 is half the width of an item
                translateX = lateralMove * colDiff;
                translateY += lateralMove * rowDiff; // Adjust Y translation as well
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