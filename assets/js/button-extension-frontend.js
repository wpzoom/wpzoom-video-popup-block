/**
 * Frontend script to apply hover styles to buttons
 */
document.addEventListener('DOMContentLoaded', function() {
    // Find all buttons with hover colors
    const buttons = document.querySelectorAll('.wp-block-button__link.has-hover-colors');
    
    buttons.forEach(button => {
        const hoverBackground = button.getAttribute('data-hover-background');
        const hoverText = button.getAttribute('data-hover-text');
        
        // Set CSS variables for the hover colors
        if (hoverBackground) {
            button.style.setProperty('--wpzoom-button-hover-background', hoverBackground);
        }
        
        if (hoverText) {
            button.style.setProperty('--wpzoom-button-hover-text', hoverText);
        }
    });
}); 