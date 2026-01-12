// Copyright (C) 2024 Stremio UI/UX Enhancement
// Enhanced Empty State Component with Accessibility and Modern Design

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Icon } from '@stremio/stremio-icons/react';
import { Button } from 'stremio/components';
import styles from './EmptyState.less';

/**
 * Enhanced Empty State component with accessibility features
 */
const EmptyState = ({ 
    icon, 
    title, 
    description, 
    actionLabel, 
    onAction,
    variant = 'default',
    size = 'medium',
    className,
    children,
    ...props 
}) => {
    const handleAction = (event) => {
        if (onAction) {
            onAction(event);
        }
    };
    
    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && onAction) {
            event.preventDefault();
            handleAction(event);
        }
    };
    
    return (
        <div 
            className={classNames(
                styles['empty-state'],
                styles[variant],
                styles[size],
                className
            )}
            role="status"
            aria-live="polite"
            aria-label={`Empty state: ${title}`}
            onKeyDown={handleKeyDown}
            tabIndex={onAction ? 0 : -1}
            {...props}
        >
            {icon && (
                <div className={styles['icon-container']}>
                    <Icon 
                        name={icon} 
                        className={styles['icon']}
                        aria-hidden="true"
                    />
                </div>
            )}
            
            {title && (
                <h2 className={styles['title']}>
                    {title}
                </h2>
            )}
            
            {description && (
                <p className={styles['description']}>
                    {description}
                </p>
            )}
            
            {children && (
                <div className={styles['content']}>
                    {children}
                </div>
            )}
            
            {actionLabel && onAction && (
                <Button 
                    className={styles['action-button']}
                    onClick={handleAction}
                    aria-label={`${actionLabel} - ${title}`}
                >
                    {actionLabel}
                </Button>
            )}
        </div>
    );
};

EmptyState.propTypes = {
    icon: PropTypes.string,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    actionLabel: PropTypes.string,
    onAction: PropTypes.func,
    variant: PropTypes.oneOf(['default', 'compact', 'large']),
    size: PropTypes.oneOf(['small', 'medium', 'large']),
    className: PropTypes.string,
    children: PropTypes.node
};

// Pre-configured empty states for common scenarios
export const EmptyLibrary = ({ onBrowse }) => (
    <EmptyState
        icon="library"
        title="Your Library is Empty"
        description="Start building your collection by adding movies and series you want to watch."
        actionLabel="Browse Content"
        onAction={onBrowse}
        variant="large"
    />
);

export const EmptySearch = ({ query, onClear }) => (
    <EmptyState
        icon="search"
        title={`No Results for "${query}"`}
        description="Try different keywords or check your spelling. You can also browse popular categories."
        actionLabel="Clear Search"
        onAction={onClear}
        variant="compact"
    />
);

export const NoAddons = ({ onBrowseAddons }) => (
    <EmptyState
        icon="addons"
        title="No Addons Installed"
        description="Install addons to access movies, series, and more content from various sources."
        actionLabel="Browse Addons"
        onAction={onBrowseAddons}
        variant="large"
    />
);

export const NoStreams = ({ onManageAddons }) => (
    <EmptyState
        icon="play"
        title="No Streams Available"
        description="We couldn't find any working streams for this content. Try installing more addons or check back later."
        actionLabel="Manage Addons"
        onAction={onManageAddons}
        variant="compact"
    />
);

export const NetworkError = ({ onRetry }) => (
    <EmptyState
        icon="warning"
        title="Connection Error"
        description="Unable to connect to the server. Please check your internet connection and try again."
        actionLabel="Try Again"
        onAction={onRetry}
        variant="compact"
    />
);

export const CalendarEmpty = ({ date }) => (
    <EmptyState
        icon="calendar"
        title={`No Releases on ${date}`}
        description="There are no new episodes or releases scheduled for this date. Check other days for upcoming content."
        variant="compact"
    />
);

export const DiscoverEmpty = ({ onRefresh }) => (
    <EmptyState
        icon="compass"
        title="Discover Something New"
        description="Explore trending content, popular series, and hidden gems. Refresh to see more recommendations."
        actionLabel="Refresh"
        onAction={onRefresh}
        variant="large"
    />
);

export default EmptyState;