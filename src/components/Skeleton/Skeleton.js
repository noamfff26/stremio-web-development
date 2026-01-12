// Copyright (C) 2024 Stremio UI/UX Enhancement
// Enhanced Skeleton Loading Component with Accessibility

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import styles from './Skeleton.less';

/**
 * Skeleton component for loading states with accessibility
 */
const Skeleton = ({ 
    variant = 'text', 
    width, 
    height, 
    count = 1, 
    className, 
    animated = true,
    rounded = false,
    circle = false,
    ...props 
}) => {
    const skeletonElements = [];
    
    for (let i = 0; i < count; i++) {
        const style = {
            width: width || '100%',
            height: height || 'auto',
            animationDelay: animated ? `${i * 0.1}s` : '0s'
        };
        
        skeletonElements.push(
            <div
                key={i}
                className={classNames(
                    styles.skeleton,
                    styles[variant],
                    {
                        [styles.animated]: animated,
                        [styles.rounded]: rounded,
                        [styles.circle]: circle
                    },
                    className
                )}
                style={style}
                role="status"
                aria-label="Loading..."
                aria-busy="true"
                aria-live="polite"
                {...props}
            >
                <span className="sr-only">Loading...</span>
            </div>
        );
    }
    
    return <>{skeletonElements}</>;
};

Skeleton.propTypes = {
    variant: PropTypes.oneOf(['text', 'rect', 'circle', 'button', 'input', 'avatar']),
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    count: PropTypes.number,
    className: PropTypes.string,
    animated: PropTypes.bool,
    rounded: PropTypes.bool,
    circle: PropTypes.bool
};

export default Skeleton;