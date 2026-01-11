// Copyright (C) 2017-2023 Smart code 203358507

const { mapErrorToCode } = require('./ErrorCodes');

/**
 * Enhanced error handler with better user feedback
 */
class ErrorHandler {
    constructor(toast) {
        this.toast = toast;
        this.errorHistory = [];
        this.maxHistorySize = 50;
    }

    /**
     * Handle an error with enhanced feedback
     */
    handle(error, context = {}) {
        try {
            const errorInfo = mapErrorToCode(error);
            
            // If errorInfo is null (non-critical addon error), don't process it
            if (errorInfo === null) {
                return null;
            }
            
            const errorEntry = {
                ...errorInfo,
                context,
                timestamp: Date.now(),
                originalError: error
            };

            // Store in history
            this.errorHistory.unshift(errorEntry);
            if (this.errorHistory.length > this.maxHistorySize) {
                this.errorHistory.pop();
            }

            // Log to console for debugging
            console.error('[ErrorHandler]', {
                code: errorInfo.code,
                title: errorInfo.title,
                error,
                context
            });

            return errorEntry;
        } catch (e) {
            console.error('[ErrorHandler] Failed to handle error:', e);
            // Return a fallback error entry
            return {
                code: 9000,
                title: 'UNKNOWN_ERROR_TITLE',
                message: 'UNKNOWN_ERROR_MESSAGE',
                severity: 'error',
                recoverable: true,
                suggestions: [],
                context,
                timestamp: Date.now(),
                originalError: error
            };
        }
    }

    /**
     * Show error as toast notification
     */
    showToast(error, context = {}, options = {}) {
        try {
            const errorEntry = this.handle(error, context);

            const toastConfig = {
                type: errorEntry.severity === 'warning' ? 'alert' : 'error',
                title: errorEntry.title,
                message: errorEntry.message,
                timeout: options.timeout || (errorEntry.recoverable ? 6000 : 8000),
                dataset: {
                    errorCode: errorEntry.code,
                    ...context
                }
            };

            // Add action button if error is recoverable
            if (errorEntry.recoverable && options.onRetry) {
                toastConfig.action = {
                    label: 'TRY_AGAIN',
                    onClick: options.onRetry
                };
            }

            if (this.toast) {
                this.toast.show(toastConfig);
            }

            return errorEntry;
        } catch (e) {
            console.error('[ErrorHandler] Failed to show toast:', e);
            // Try to show a basic error toast as fallback
            if (this.toast) {
                try {
                    this.toast.show({
                        type: 'error',
                        title: 'An error occurred',
                        timeout: 4000
                    });
                } catch (fallbackError) {
                    console.error('[ErrorHandler] Fallback toast also failed:', fallbackError);
                }
            }
            return null;
        }
    }

    /**
     * Get error suggestions for display
     */
    getSuggestions(errorCode) {
        const errorEntry = this.errorHistory.find(e => e.code === errorCode);
        return errorEntry?.suggestions || [];
    }

    /**
     * Clear error history
     */
    clearHistory() {
        this.errorHistory = [];
    }

    /**
     * Get recent errors
     */
    getRecentErrors(limit = 10) {
        return this.errorHistory.slice(0, limit);
    }
}

module.exports = ErrorHandler;
