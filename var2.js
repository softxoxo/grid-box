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
                    neighbors.push({ item: items[newIndex], distance: Math.max(Math.abs(i), Math.abs(j)) });
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
            item.style.transform = 'translateY(0)';
            item.style.zIndex = '1';
        });

        neighbors.forEach(({ item, distance }) => {
            const elevation = distance === 0 ? 20 : 20 / (distance + 1);
            item.style.transform = `translateY(-${elevation}px)`;
            item.style.zIndex = Math.floor(10 - distance);
        });
    }

    function resetHillEffect() {
        items.forEach(item => {
            item.style.transform = 'translateY(0)';
            item.style.zIndex = '1';
        });
    }

    grid.addEventListener('mousemove', applyHillEffect);
    grid.addEventListener('mouseleave', resetHillEffect);
});