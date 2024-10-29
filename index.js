document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.format-grid');
    const items = Array.from(grid.querySelectorAll('.format-item'));
    const columns = getColumns(items, grid);

    // Initial setup: hide all items
    items.forEach(item => {
        item.style.transform = 'translateY(20px)';
    });

    animateColumns(columns);
    setupClickEffects(items);
});

function getColumns(items, grid) {
    const columns = [];
    const columnCount = getComputedStyle(grid).gridTemplateColumns.split(' ').length;

    for (let i = 0; i < columnCount; i++) {
        columns.push(items.filter((_, index) => index % columnCount === i));
    }

    return columns;
}

function animateColumns(columns) {
    columns.forEach((column, columnIndex) => {
        column.forEach((item, itemIndex) => {
            setTimeout(() => {
                item.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
                
                // Remove inline styles after animation
                setTimeout(() => {
                    item.style.removeProperty('transition');
                    item.style.removeProperty('transform');
                }, 500); // Match this to the transition duration
            }, columnIndex * 300 + itemIndex * 100);
        });
    });
}

function setupClickEffects(items) {
    items.forEach(item => {
        item.addEventListener('click', () => {
            // Remove any existing hover animations
            item.classList.remove('hover-active');
            
            // Add clicked class for animation
            item.classList.add('clicked');
            
            // Remove the 'clicked' class after the animation duration
            setTimeout(() => {
                item.classList.remove('clicked');
                
                // Reapply hover effect if mouse is still over the item
                if (item.matches(':hover')) {
                    item.classList.add('hover-active');
                }
            }, 120); // This should match the CSS transition duration
        });

        // Add hover class when mouse enters
        item.addEventListener('mouseenter', () => {
            if (!item.classList.contains('clicked')) {
                item.classList.add('hover-active');
            }
        });

        // Remove hover class when mouse leaves
        item.addEventListener('mouseleave', () => {
            item.classList.remove('hover-active');
        });
    });
}