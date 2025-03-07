/**
 * Frontend script to apply hover styles to buttons
 * This script handles the different HTML structure between editor and frontend
 * and preserves normal state colors while enabling hover effects
 */
console.log('WPZOOM Button Extension Frontend Script Loaded');

document.addEventListener('DOMContentLoaded', function() {
    console.log('WPZOOM Button Extension: DOM Content Loaded');
    
    // Helper function to process color values
    function processColorValue(colorValue, button) {
        // Handle color-mix function
        if (colorValue && colorValue.includes('color-mix')) {
            console.log(`Processing complex color value: ${colorValue}`);
            
            // If using currentColor, replace it with the actual current color
            if (colorValue.includes('currentColor')) {
                const computedStyle = window.getComputedStyle(button);
                const currentColor = computedStyle.color;
                console.log(`Replacing currentColor with: ${currentColor}`);
                
                // For simplicity, if we have color-mix with currentColor, use a semi-transparent version of the text color
                return `${currentColor.replace('rgb', 'rgba').replace(')', ', 0.2)')}`;
            }
            
            // If we can't process it, return a fallback
            return colorValue;
        }
        
        return colorValue;
    }
    
    // First, let's log all buttons on the page for debugging
    const allButtons = document.querySelectorAll('.wp-block-button');
    console.log('WPZOOM Button Extension: Found ' + allButtons.length + ' total button containers');
    
    // Find all button containers with hover colors
    const buttonContainers = document.querySelectorAll('.wp-block-button.has-hover-colors, .wp-block-button[data-hover-background], .wp-block-button[data-hover-text]');
    console.log('WPZOOM Button Extension: Found ' + buttonContainers.length + ' button containers with hover attributes');
    
    // Process each button container
    buttonContainers.forEach(function(container, index) {
        // Get the actual button link inside the container
        const button = container.querySelector('.wp-block-button__link');
        if (!button) {
            console.log(`Button container ${index + 1} has no button link inside`);
            return;
        }
        
        // Get hover colors from the container (not the button)
        let hoverBackground = container.getAttribute('data-hover-background');
        let hoverText = container.getAttribute('data-hover-text');
        
        // Process complex color values
        hoverBackground = processColorValue(hoverBackground, button);
        hoverText = processColorValue(hoverText, button);
        
        console.log(`Processing Button ${index + 1}:`, {
            container: container,
            button: button,
            originalHoverBackground: container.getAttribute('data-hover-background'),
            originalHoverText: container.getAttribute('data-hover-text'),
            processedHoverBackground: hoverBackground,
            processedHoverText: hoverText,
            containerClasses: container.className,
            buttonClasses: button.className
        });
        
        // Ensure the container has the has-hover-colors class
        if (!container.classList.contains('has-hover-colors')) {
            console.log(`Adding missing has-hover-colors class to button ${index + 1}`);
            container.classList.add('has-hover-colors');
        }
        
        if (hoverBackground || hoverText) {
            // Store original colors of the button
            const computedStyle = window.getComputedStyle(button);
            const originalBgColor = computedStyle.backgroundColor;
            const originalTextColor = computedStyle.color;
            
            console.log(`Button ${index + 1} original colors:`, {
                backgroundColor: originalBgColor,
                textColor: originalTextColor
            });
            
            // Add transition to the button (not the container)
            // Check if the button already has a transition style
            const currentStyle = button.getAttribute('style') || '';
            if (!currentStyle.includes('transition')) {
                button.style.transition = 'all 0.3s ease';
            }
            
            // Create a test div to check if the color values are valid
            const testDiv = document.createElement('div');
            document.body.appendChild(testDiv);
            
            // Test if the hover background color is valid
            if (hoverBackground) {
                try {
                    testDiv.style.backgroundColor = hoverBackground;
                    const computedBg = window.getComputedStyle(testDiv).backgroundColor;
                    if (computedBg === 'rgba(0, 0, 0, 0)' && hoverBackground !== 'transparent') {
                        console.log(`Invalid background color: ${hoverBackground}, using fallback`);
                        // If the color is invalid, try to extract a hex or rgb value
                        const colorMatch = hoverBackground.match(/#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}|rgb\([^)]+\)|rgba\([^)]+\)/);
                        if (colorMatch) {
                            hoverBackground = colorMatch[0];
                            console.log(`Extracted color: ${hoverBackground}`);
                        } else {
                            // If we can't extract a valid color, use a semi-transparent version of the text color
                            hoverBackground = originalTextColor.replace('rgb', 'rgba').replace(')', ', 0.2)');
                            console.log(`Using fallback color: ${hoverBackground}`);
                        }
                    }
                } catch (e) {
                    console.log(`Error testing background color: ${e.message}`);
                    // Use a fallback color
                    hoverBackground = originalTextColor.replace('rgb', 'rgba').replace(')', ', 0.2)');
                }
            }
            
            // Clean up the test div
            document.body.removeChild(testDiv);
            
            // Apply hover effects to the button (not the container)
            button.onmouseover = function() {
                console.log(`Button ${index + 1} hover activated`);
                if (hoverBackground) {
                    this.style.backgroundColor = hoverBackground;
                    console.log(`Applied background color: ${hoverBackground}`);
                }
                if (hoverText) {
                    this.style.color = hoverText;
                    console.log(`Applied text color: ${hoverText}`);
                }
            };
            
            button.onmouseout = function() {
                console.log(`Button ${index + 1} hover deactivated`);
                this.style.backgroundColor = originalBgColor;
                this.style.color = originalTextColor;
            };
            
            // Also handle focus for accessibility
            button.onfocus = button.onmouseover;
            button.onblur = button.onmouseout;
            
            // Add a special class to mark this button as processed
            button.classList.add('wpzoom-hover-processed');
            
            // Test the hover effect once
            console.log(`Testing hover effect on Button ${index + 1}`);
            setTimeout(function() {
                button.dispatchEvent(new MouseEvent('mouseover'));
                
                setTimeout(function() {
                    button.dispatchEvent(new MouseEvent('mouseout'));
                    console.log(`Hover test complete for Button ${index + 1}`);
                }, 300);
            }, 500 + (index * 200));
        } else {
            console.log(`Button ${index + 1} has no hover colors defined`);
        }
    });
    
    // If no button containers were found with our primary selectors, try a more aggressive approach
    if (buttonContainers.length === 0) {
        console.log('WPZOOM Button Extension: No button containers found with primary selectors. Trying more aggressive approach.');
        
        // Look for any button-like elements
        const allPossibleContainers = document.querySelectorAll('.wp-block-button, .wp-block-buttons > div');
        console.log('WPZOOM Button Extension: Found ' + allPossibleContainers.length + ' possible button containers');
        
        allPossibleContainers.forEach(function(container, index) {
            // Check if the container HTML contains data attributes
            const containerHTML = container.outerHTML;
            const hasBgAttribute = containerHTML.includes('data-hover-background');
            const hasTextAttribute = containerHTML.includes('data-hover-text');
            
            if (hasBgAttribute || hasTextAttribute) {
                console.log(`Found button container with hover attributes in HTML: Container ${index + 1}`);
                
                // Try to extract the values
                let hoverBackground = null;
                let hoverText = null;
                
                const bgMatch = containerHTML.match(/data-hover-background="([^"]*)"/);
                if (bgMatch && bgMatch[1]) {
                    hoverBackground = bgMatch[1];
                }
                
                const textMatch = containerHTML.match(/data-hover-text="([^"]*)"/);
                if (textMatch && textMatch[1]) {
                    hoverText = textMatch[1];
                }
                
                // Find the button inside
                const button = container.querySelector('.wp-block-button__link, a');
                if (!button) {
                    console.log(`Container ${index + 1} has no button inside`);
                    return;
                }
                
                // Process complex color values
                hoverBackground = processColorValue(hoverBackground, button);
                hoverText = processColorValue(hoverText, button);
                
                console.log(`Extracted values for Container ${index + 1}:`, {
                    originalHoverBackground: container.getAttribute('data-hover-background'),
                    originalHoverText: container.getAttribute('data-hover-text'),
                    processedHoverBackground: hoverBackground,
                    processedHoverText: hoverText
                });
                
                // Store original colors
                const computedStyle = window.getComputedStyle(button);
                const originalBgColor = computedStyle.backgroundColor;
                const originalTextColor = computedStyle.color;
                
                // Add transition to the button
                const currentStyle = button.getAttribute('style') || '';
                if (!currentStyle.includes('transition')) {
                    button.style.transition = 'all 0.3s ease';
                }
                
                // Apply hover effects to the button
                button.onmouseover = function() {
                    console.log(`Button ${index + 1} hover activated (aggressive method)`);
                    if (hoverBackground) this.style.backgroundColor = hoverBackground;
                    if (hoverText) this.style.color = hoverText;
                };
                
                button.onmouseout = function() {
                    console.log(`Button ${index + 1} hover deactivated (aggressive method)`);
                    this.style.backgroundColor = originalBgColor;
                    this.style.color = originalTextColor;
                };
                
                // Also handle focus for accessibility
                button.onfocus = button.onmouseover;
                button.onblur = button.onmouseout;
                
                // Add a special class to mark this button as processed
                button.classList.add('wpzoom-hover-processed');
            }
        });
    }
}); 