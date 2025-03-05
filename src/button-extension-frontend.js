/**
 * Frontend script to apply hover styles to buttons
 * This script mimics the editor behavior by injecting style tags
 */
document.addEventListener('DOMContentLoaded', function() {
    // Find all buttons with hover colors
    const buttons = document.querySelectorAll('.wp-block-button__link.has-hover-colors');
    
    // Create a style element to hold all our hover styles
    const styleElement = document.createElement('style');
    document.head.appendChild(styleElement);
    
    // Build the stylesheet content
    let styleContent = '';
    
    buttons.forEach((button, index) => {
        const hoverBackground = button.getAttribute('data-hover-background');
        const hoverText = button.getAttribute('data-hover-text');
        
        if (hoverBackground || hoverText) {
            // Add a unique ID to the button for targeting
            const buttonId = `wpzoom-button-frontend-${index}`;
            button.id = buttonId;
            
            // Add hover styles for this specific button
            styleContent += `
                #${buttonId}:hover {
                    ${hoverBackground ? `background-color: ${hoverBackground} !important;` : ''}
                    ${hoverText ? `color: ${hoverText} !important;` : ''}
                    transition: all 0.3s ease !important;
                }
            `;
        }
    });
    
    // Apply the styles
    styleElement.textContent = styleContent;
    
    // For browsers that might not support the style tag approach,
    // also add direct event listeners as a fallback
    buttons.forEach(button => {
        const hoverBackground = button.getAttribute('data-hover-background');
        const hoverText = button.getAttribute('data-hover-text');
        
        if (hoverBackground || hoverText) {
            // Store original styles
            const computedStyle = window.getComputedStyle(button);
            const originalBgColor = computedStyle.backgroundColor;
            const originalTextColor = computedStyle.color;
            
            // Add transition directly to the button
            button.style.transition = 'all 0.3s ease';
            
            // Add event listeners
            button.addEventListener('mouseenter', function() {
                if (hoverBackground) {
                    this.style.backgroundColor = hoverBackground;
                }
                if (hoverText) {
                    this.style.color = hoverText;
                }
            });
            
            button.addEventListener('mouseleave', function() {
                if (hoverBackground) {
                    this.style.backgroundColor = originalBgColor;
                }
                if (hoverText) {
                    this.style.color = originalTextColor;
                }
            });
        }
    });
}); 