// Copyright (C) 2024 Stremio UI/UX Enhancement
// React Accessibility Hooks for Enhanced User Experience

import { useState, useEffect, useRef, useCallback } from 'react';
import { focusManagement, screenReader, keyboardNavigation, aria, motion, touch, highContrast, colorContrast } from './utils';

/**
 * Hook for managing focus within a container
 * @param {boolean} [active=true] - Whether focus trap is active
 * @param {Object} [options] - Focus trap options
 * @returns {Object} Focus trap ref and controls
 */
export const useFocusTrap = (active = true, options = {}) => {
    const containerRef = useRef(null);
    const [isActive, setIsActive] = useState(active);
    const cleanupRef = useRef(null);
    
    useEffect(() => {
        if (isActive && containerRef.current) {
            cleanupRef.current = focusManagement.trapFocus(containerRef.current, options.initialFocus);
        } else if (cleanupRef.current) {
            cleanupRef.current();
            cleanupRef.current = null;
        }
        
        return () => {
            if (cleanupRef.current) {
                cleanupRef.current();
                cleanupRef.current = null;
            }
        };
    }, [isActive, options.initialFocus]);
    
    return {
        ref: containerRef,
        activate: () => setIsActive(true),
        deactivate: () => setIsActive(false),
        isActive
    };
};

/**
 * Hook for announcing messages to screen readers
 * @param {string} [message] - Message to announce
 * @param {string} [level='polite'] - Announcement level
 * @param {number} [delay=100] - Delay before announcement
 */
export const useScreenReader = (message, level = 'polite', delay = 100) => {
    useEffect(() => {
        if (message) {
            screenReader.announce(message, level, delay);
        }
    }, [message, level, delay]);
};

/**
 * Hook for keyboard navigation
 * @param {Object} [handlers] - Keyboard event handlers
 * @param {Array} [dependencies] - Dependencies for useCallback
 * @returns {Object} Keyboard handlers
 */
export const useKeyboardNavigation = (handlers = {}, dependencies = []) => {
    const handleKeyDown = useCallback((event) => {
        keyboardNavigation.handleKeyboard(event, handlers);
    }, dependencies);
    
    return { onKeyDown: handleKeyDown };
};

/**
 * Hook for creating keyboard shortcuts
 * @param {Object} shortcuts - Map of key combinations to handlers
 * @param {Array} [dependencies] - Dependencies for useCallback
 * @returns {Object} Keyboard handler
 */
export const useKeyboardShortcuts = (shortcuts, dependencies = []) => {
    const handleKeyDown = useCallback((event) => {
        const handler = keyboardNavigation.createShortcuts(shortcuts);
        handler(event);
    }, dependencies);
    
    useEffect(() => {
        const handleKeyPress = (event) => {
            const handler = keyboardNavigation.createShortcuts(shortcuts);
            handler(event);
        };
        
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [shortcuts]);
    
    return { onKeyDown: handleKeyDown };
};

/**
 * Hook for managing ARIA attributes
 * @param {Object} [options] - ARIA options
 * @returns {Object} ARIA attributes
 */
export const useAria = (options = {}) => {
    const [ariaAttributes, setAriaAttributes] = useState({});
    
    useEffect(() => {
        const attributes = {};
        
        if (options.label) {
            Object.assign(attributes, aria.createLabel(options.label, options.description));
        }
        
        if (options.field) {
            Object.assign(attributes, aria.createFieldAttributes(options.field));
        }
        
        setAriaAttributes(attributes);
    }, [options]);
    
    return ariaAttributes;
};

/**
 * Hook for detecting motion preferences
 * @returns {Object} Motion preferences and utilities
 */
export const useMotionPreferences = () => {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
    
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(mediaQuery.matches);
        
        const handleChange = (event) => {
            setPrefersReducedMotion(event.matches);
        };
        
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);
    
    return {
        prefersReducedMotion,
        getAnimationDuration: (normalDuration, reducedDuration = 0) => 
            motion.getAnimationDuration(normalDuration, reducedDuration),
        createAnimation: (config) => motion.createAnimation(config)
    };
};

/**
 * Hook for detecting touch capabilities
 * @returns {Object} Touch capabilities and utilities
 */
export const useTouchDetection = () => {
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    
    useEffect(() => {
        setIsTouchDevice(touch.isTouchDevice());
    }, []);
    
    return {
        isTouchDevice,
        minTouchTarget: touch.getMinTouchTarget(),
        createTouchHandlers: (handlers) => touch.createTouchHandlers(handlers)
    };
};

/**
 * Hook for detecting high contrast mode
 * @returns {Object} High contrast preferences and utilities
 */
export const useHighContrast = () => {
    const [isHighContrast, setIsHighContrast] = useState(false);
    
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-contrast: high)');
        setIsHighContrast(mediaQuery.matches);
        
        const handleChange = (event) => {
            setIsHighContrast(event.matches);
        };
        
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);
    
    return {
        isHighContrast,
        getColor: (normalColor, highContrastColor) => 
            highContrast.getColor(normalColor, highContrastColor)
    };
};

/**
 * Hook for managing component focus state
 * @param {boolean} [initialFocus=false] - Whether to focus initially
 * @param {Object} [options] - Focus options
 * @returns {Object} Focus ref and controls
 */
export const useFocus = (initialFocus = false, options = {}) => {
    const elementRef = useRef(null);
    const [isFocused, setIsFocused] = useState(false);
    
    useEffect(() => {
        if (initialFocus && elementRef.current) {
            focusManagement.setInitialFocus(elementRef.current, options);
        }
    }, [initialFocus, options]);
    
    const handleFocus = useCallback(() => {
        setIsFocused(true);
    }, []);
    
    const handleBlur = useCallback(() => {
        setIsFocused(false);
    }, []);
    
    return {
        ref: elementRef,
        isFocused,
        onFocus: handleFocus,
        onBlur: handleBlur,
        focus: () => elementRef.current?.focus(),
        blur: () => elementRef.current?.blur()
    };
};

/**
 * Hook for managing skip links
 * @param {string} [targetId] - ID of main content to skip to
 * @returns {Object} Skip link props
 */
export const useSkipLink = (targetId = 'main-content') => {
    const handleSkip = useCallback((event) => {
        event.preventDefault();
        const target = document.getElementById(targetId);
        if (target) {
            target.setAttribute('tabindex', '-1');
            target.focus();
            target.scrollIntoView({ behavior: 'smooth' });
            
            // Announce to screen readers
            screenReader.announce('Skipped to main content');
        }
    }, [targetId]);
    
    return {
        href: `#${targetId}`,
        onClick: handleSkip,
        className: 'skip-link',
        children: 'Skip to main content'
    };
};

/**
 * Hook for color contrast checking
 * @param {string} [foreground] - Foreground color
 * @param {string} [background] - Background color
 * @param {string} [size='normal'] - Text size
 * @returns {Object} Contrast information
 */
export const useColorContrast = (foreground, background, size = 'normal') => {
    const [contrastInfo, setContrastInfo] = useState({
        ratio: 0,
        meetsWCAG: false,
        requiredRatio: size === 'large' ? 3 : 4.5
    });
    
    useEffect(() => {
        if (foreground && background) {
            const ratio = colorContrast.getContrastRatio(foreground, background);
            const meetsWCAG = colorContrast.meetsWCAGAA(foreground, background, size);
            
            setContrastInfo({
                ratio: Math.round(ratio * 100) / 100,
                meetsWCAG,
                requiredRatio: size === 'large' ? 3 : 4.5
            });
        }
    }, [foreground, background, size]);
    
    return contrastInfo;
};

/**
 * Hook for managing loading states with announcements
 * @param {boolean} [isLoading=false] - Loading state
 * @param {string} [loadingMessage='Loading...'] - Loading message
 * @param {string} [completeMessage='Loading complete'] - Complete message
 */
export const useLoadingState = (isLoading = false, loadingMessage = 'Loading...', completeMessage = 'Loading complete') => {
    const [wasLoading, setWasLoading] = useState(isLoading);
    
    useEffect(() => {
        if (isLoading && !wasLoading) {
            screenReader.announce(loadingMessage, 'polite');
        } else if (!isLoading && wasLoading) {
            screenReader.announce(completeMessage, 'polite');
        }
        setWasLoading(isLoading);
    }, [isLoading, wasLoading, loadingMessage, completeMessage]);
};

/**
 * Hook for managing error states with announcements
 * @param {string|null} [error=null] - Error message
 * @param {string} [prefix='Error'] - Error prefix
 */
export const useErrorState = (error = null, prefix = 'Error') => {
    useEffect(() => {
        if (error) {
            screenReader.announce(`${prefix}: ${error}`, 'assertive');
        }
    }, [error, prefix]);
};

/**
 * Hook for creating accessible form fields
 * @param {Object} [options] - Field options
 * @returns {Object} Field attributes and helpers
 */
export const useAccessibleField = (options = {}) => {
    const fieldId = useRef(aria.generateId('field')).current;
    const labelId = useRef(aria.generateId('label')).current;
    const errorId = useRef(aria.generateId('error')).current;
    const descriptionId = useRef(aria.generateId('description')).current;
    
    const fieldAttributes = {
        id: fieldId,
        'aria-labelledby': labelId,
        'aria-describedby': [
            options.description ? descriptionId : null,
            options.error ? errorId : null,
            options.describedBy
        ].filter(Boolean).join(' ') || undefined,
        'aria-invalid': options.error ? 'true' : 'false',
        'aria-required': options.required ? 'true' : 'false',
        'aria-errormessage': options.error ? errorId : undefined
    };
    
    const labelAttributes = {
        id: labelId,
        htmlFor: fieldId
    };
    
    const errorAttributes = {
        id: errorId,
        role: 'alert',
        'aria-live': 'polite'
    };
    
    const descriptionAttributes = {
        id: descriptionId
    };
    
    return {
        fieldAttributes,
        labelAttributes,
        errorAttributes,
        descriptionAttributes,
        ids: {
            field: fieldId,
            label: labelId,
            error: errorId,
            description: descriptionId
        }
    };
};

export default {
    useFocusTrap,
    useScreenReader,
    useKeyboardNavigation,
    useKeyboardShortcuts,
    useAria,
    useMotionPreferences,
    useTouchDetection,
    useHighContrast,
    useFocus,
    useSkipLink,
    useColorContrast,
    useLoadingState,
    useErrorState,
    useAccessibleField
};
