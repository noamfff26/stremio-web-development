// Copyright (C) 2024 Stremio UI/UX Enhancement
// Comprehensive Accessibility Utilities for WCAG 2.1 AA Compliance

/**
 * Focus Management Utilities
 */
export const focusManagement = {
    /**
     * Trap focus within a container element (for modals, dropdowns, etc.)
     * @param {HTMLElement} container - The container to trap focus within
     * @param {HTMLElement} [initialFocus] - Element to focus initially
     * @returns {Function} Function to restore focus to previous element
     */
    trapFocus(container, initialFocus) {
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];
        
        const previousActiveElement = document.activeElement;
        
        // Focus initial element or first focusable
        if (initialFocus) {
            initialFocus.focus();
        } else if (firstFocusable) {
            firstFocusable.focus();
        }
        
        const handleKeyDown = (event) => {
            if (event.key === 'Tab') {
                if (event.shiftKey) {
                    // Shift + Tab
                    if (document.activeElement === firstFocusable) {
                        event.preventDefault();
                        lastFocusable.focus();
                    }
                } else {
                    // Tab
                    if (document.activeElement === lastFocusable) {
                        event.preventDefault();
                        firstFocusable.focus();
                    }
                }
            }
        };
        
        container.addEventListener('keydown', handleKeyDown);
        
        // Return cleanup function
        return () => {
            container.removeEventListener('keydown', handleKeyDown);
            if (previousActiveElement) {
                previousActiveElement.focus();
            }
        };
    },
    
    /**
     * Set initial focus on an element with fallback
     * @param {HTMLElement} element - Element to focus
     * @param {Object} [options] - Focus options
     */
    setInitialFocus(element, options = {}) {
        if (!element) return;
        
        // Try to focus the element
        try {
            element.focus(options);
            
            // If element is not focusable, find first focusable child
            if (document.activeElement !== element) {
                const focusableChild = element.querySelector(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                if (focusableChild) {
                    focusableChild.focus(options);
                }
            }
        } catch (error) {
            console.warn('Failed to set focus:', error);
        }
    }
};

/**
 * Screen Reader Utilities
 */
export const screenReader = {
    /**
     * Create live region for announcements
     * @param {string} [id] - ID for the live region
     * @param {string} [level='polite'] - Announcement level ('polite' or 'assertive')
     * @returns {HTMLElement} The live region element
     */
    createLiveRegion(id = 'sr-live-region', level = 'polite') {
        const liveRegion = document.createElement('div');
        liveRegion.id = id;
        liveRegion.setAttribute('aria-live', level);
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.style.position = 'absolute';
        liveRegion.style.left = '-10000px';
        liveRegion.style.width = '1px';
        liveRegion.style.height = '1px';
        liveRegion.style.overflow = 'hidden';
        document.body.appendChild(liveRegion);
        return liveRegion;
    },
    
    /**
     * Announce a message to screen readers
     * @param {string} message - Message to announce
     * @param {string} [level='polite'] - Announcement level
     * @param {number} [delay=100] - Delay before announcement
     */
    announce(message, level = 'polite', delay = 100) {
        const liveRegion = document.getElementById('sr-live-region') || 
                          this.createLiveRegion('sr-live-region', level);
        
        setTimeout(() => {
            liveRegion.textContent = message;
            
            // Clear after announcement
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }, delay);
    },
    
    /**
     * Create visually hidden content for screen readers
     * @param {string} text - Text to hide visually
     * @returns {string} Screen reader only text
     */
    visuallyHidden(text) {
        return `<span class="sr-only">${text}</span>`;
    }
};

/**
 * Color Contrast Utilities
 */
export const colorContrast = {
    /**
     * Calculate relative luminance of a color
     * @param {string} color - Color in hex format
     * @returns {number} Relative luminance (0-1)
     */
    getLuminance(color) {
        const rgb = this.hexToRgb(color);
        if (!rgb) return 0;
        
        const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    },
    
    /**
     * Calculate contrast ratio between two colors
     * @param {string} color1 - First color in hex format
     * @param {string} color2 - Second color in hex format
     * @returns {number} Contrast ratio (1-21)
     */
    getContrastRatio(color1, color2) {
        const lum1 = this.getLuminance(color1);
        const lum2 = this.getLuminance(color2);
        const brightest = Math.max(lum1, lum2);
        const darkest = Math.min(lum1, lum2);
        return (brightest + 0.05) / (darkest + 0.05);
    },
    
    /**
     * Check if contrast ratio meets WCAG AA standards
     * @param {string} foreground - Foreground color
     * @param {string} background - Background color
     * @param {string} [size='normal'] - Text size ('normal' or 'large')
     * @returns {boolean} Whether contrast meets WCAG AA
     */
    meetsWCAGAA(foreground, background, size = 'normal') {
        const ratio = this.getContrastRatio(foreground, background);
        const requiredRatio = size === 'large' ? 3 : 4.5;
        return ratio >= requiredRatio;
    },
    
    /**
     * Convert hex color to RGB
     * @param {string} hex - Hex color
     * @returns {Object|null} RGB values or null
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
};

/**
 * Keyboard Navigation Utilities
 */
export const keyboardNavigation = {
    /**
     * Handle common keyboard interactions
     * @param {KeyboardEvent} event - Keyboard event
     * @param {Object} [handlers] - Key handlers
     */
    handleKeyboard(event, handlers = {}) {
        const key = event.key.toLowerCase();
        const { onEnter, onEscape, onArrowUp, onArrowDown, onArrowLeft, onArrowRight, onTab } = handlers;
        
        switch (key) {
            case 'enter':
            case ' ':
                if (onEnter) {
                    event.preventDefault();
                    onEnter(event);
                }
                break;
            case 'escape':
                if (onEscape) {
                    event.preventDefault();
                    onEscape(event);
                }
                break;
            case 'arrowup':
                if (onArrowUp) {
                    event.preventDefault();
                    onArrowUp(event);
                }
                break;
            case 'arrowdown':
                if (onArrowDown) {
                    event.preventDefault();
                    onArrowDown(event);
                }
                break;
            case 'arrowleft':
                if (onArrowLeft) {
                    event.preventDefault();
                    onArrowLeft(event);
                }
                break;
            case 'arrowright':
                if (onArrowRight) {
                    event.preventDefault();
                    onArrowRight(event);
                }
                break;
            case 'tab':
                if (onTab) {
                    onTab(event);
                }
                break;
        }
    },
    
    /**
     * Create keyboard shortcuts handler
     * @param {Object} shortcuts - Map of key combinations to handlers
     * @returns {Function} Keyboard event handler
     */
    createShortcuts(shortcuts) {
        return (event) => {
            const key = event.key.toLowerCase();
            const ctrl = event.ctrlKey;
            const alt = event.altKey;
            const shift = event.shiftKey;
            const meta = event.metaKey;
            
            // Build key combination string
            const combination = [
                ctrl ? 'ctrl' : '',
                alt ? 'alt' : '',
                shift ? 'shift' : '',
                meta ? 'meta' : '',
                key
            ].filter(Boolean).join('+');
            
            // Check for matching shortcut
            if (shortcuts[combination]) {
                event.preventDefault();
                shortcuts[combination](event);
            }
        };
    }
};

/**
 * ARIA Utilities
 */
export const aria = {
    /**
     * Generate unique ARIA IDs
     * @param {string} prefix - Prefix for the ID
     * @returns {string} Unique ID
     */
    generateId(prefix = 'aria') {
        return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
    },
    
    /**
     * Create ARIA label with optional description
     * @param {string} label - Main label
     * @param {string} [description] - Optional description
     * @returns {Object} ARIA attributes
     */
    createLabel(label, description) {
        const attrs = { 'aria-label': label };
        if (description) {
            const descId = this.generateId('desc');
            attrs['aria-describedby'] = descId;
            attrs['data-description'] = description;
        }
        return attrs;
    },
    
    /**
     * Create ARIA attributes for form fields
     * @param {Object} options - Field options
     * @returns {Object} ARIA attributes
     */
    createFieldAttributes(options = {}) {
        const { label, error, required, describedBy } = options;
        const attrs = {};
        
        if (label) {
            const labelId = this.generateId('label');
            attrs['aria-labelledby'] = labelId;
        }
        
        if (error) {
            const errorId = this.generateId('error');
            attrs['aria-errormessage'] = errorId;
            attrs['aria-invalid'] = 'true';
        }
        
        if (required) {
            attrs['aria-required'] = 'true';
        }
        
        if (describedBy) {
            attrs['aria-describedby'] = describedBy;
        }
        
        return attrs;
    }
};

/**
 * Motion and Animation Utilities
 */
export const motion = {
    /**
     * Check if user prefers reduced motion
     * @returns {boolean} Whether reduced motion is preferred
     */
    prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },
    
    /**
     * Get appropriate animation duration based on user preferences
     * @param {number} normalDuration - Normal duration in milliseconds
     * @param {number} reducedDuration - Reduced duration in milliseconds
     * @returns {number} Appropriate duration
     */
    getAnimationDuration(normalDuration, reducedDuration = 0) {
        return this.prefersReducedMotion() ? reducedDuration : normalDuration;
    },
    
    /**
     * Create animation with reduced motion support
     * @param {Object} config - Animation configuration
     * @returns {Object} Animation properties
     */
    createAnimation(config) {
        const { normal, reduced } = config;
        return this.prefersReducedMotion() ? reduced : normal;
    }
};

/**
 * Touch and Mobile Utilities
 */
export const touch = {
    /**
     * Check if device supports touch
     * @returns {boolean} Whether touch is supported
     */
    isTouchDevice() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    },
    
    /**
     * Get minimum touch target size
     * @returns {number} Minimum size in pixels
     */
    getMinTouchTarget() {
        return 44; // WCAG recommended minimum
    },
    
    /**
     * Create touch-friendly event handlers
     * @param {Object} handlers - Touch and click handlers
     * @returns {Object} Combined handlers
     */
    createTouchHandlers(handlers) {
        const { onTouchStart, onTouchEnd, onClick } = handlers;
        
        if (this.isTouchDevice()) {
            return {
                onTouchStart,
                onTouchEnd
            };
        }
        
        return {
            onClick
        };
    }
};

/**
 * High Contrast Mode Utilities
 */
export const highContrast = {
    /**
     * Check if high contrast mode is active
     * @returns {boolean} Whether high contrast is preferred
     */
    isHighContrast() {
        return window.matchMedia('(prefers-contrast: high)').matches;
    },
    
    /**
     * Get high contrast color if needed
     * @param {string} normalColor - Normal color
     * @param {string} highContrastColor - High contrast color
     * @returns {string} Appropriate color
     */
    getColor(normalColor, highContrastColor) {
        return this.isHighContrast() ? highContrastColor : normalColor;
    }
};

export default {
    focusManagement,
    screenReader,
    colorContrast,
    keyboardNavigation,
    aria,
    motion,
    touch,
    highContrast
};