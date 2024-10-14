document.addEventListener('DOMContentLoaded', function() {
    const gridItems = document.querySelectorAll('.format-item');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                animateGridItems();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    observer.observe(document.querySelector('.format-grid'));

    function animateGridItems() {
        gridItems.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('animate');
            }, index * 100); 
        });
    }
});