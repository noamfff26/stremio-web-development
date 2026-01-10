// Copyright (C) 2017-2023 Smart code 203358507

/**
 * Enhanced error code system for better user feedback
 */

const ERROR_CODES = {
    // Network errors (1xxx)
    NETWORK_ERROR: {
        code: 1000,
        title: 'NETWORK_ERROR_TITLE',
        message: 'NETWORK_ERROR_MESSAGE',
        severity: 'error',
        recoverable: true,
        suggestions: [
            'CHECK_INTERNET_CONNECTION',
            'TRY_AGAIN_LATER',
            'CHECK_FIREWALL_SETTINGS'
        ]
    },
    CONNECTION_TIMEOUT: {
        code: 1001,
        title: 'CONNECTION_TIMEOUT_TITLE',
        message: 'CONNECTION_TIMEOUT_MESSAGE',
        severity: 'error',
        recoverable: true,
        suggestions: [
            'CHECK_INTERNET_SPEED',
            'TRY_AGAIN'
        ]
    },
    OFFLINE: {
        code: 1002,
        title: 'OFFLINE_TITLE',
        message: 'OFFLINE_MESSAGE',
        severity: 'warning',
        recoverable: true,
        suggestions: [
            'CONNECT_TO_INTERNET'
        ]
    },

    // Authentication errors (2xxx)
    AUTH_FAILED: {
        code: 2000,
        title: 'AUTH_FAILED_TITLE',
        message: 'AUTH_FAILED_MESSAGE',
        severity: 'error',
        recoverable: true,
        suggestions: [
            'CHECK_CREDENTIALS',
            'RESET_PASSWORD'
        ]
    },
    SESSION_EXPIRED: {
        code: 2001,
        title: 'SESSION_EXPIRED_TITLE',
        message: 'SESSION_EXPIRED_MESSAGE',
        severity: 'warning',
        recoverable: true,
        suggestions: [
            'LOGIN_AGAIN'
        ]
    },

    // Addon errors (3xxx)
    ADDON_INSTALL_FAILED: {
        code: 3000,
        title: 'ADDON_INSTALL_FAILED_TITLE',
        message: 'ADDON_INSTALL_FAILED_MESSAGE',
        severity: 'error',
        recoverable: true,
        suggestions: [
            'CHECK_ADDON_URL',
            'TRY_DIFFERENT_ADDON',
            'CONTACT_ADDON_DEVELOPER'
        ]
    },
    ADDON_LOAD_FAILED: {
        code: 3001,
        title: 'ADDON_LOAD_FAILED_TITLE',
        message: 'ADDON_LOAD_FAILED_MESSAGE',
        severity: 'error',
        recoverable: true,
        suggestions: [
            'REINSTALL_ADDON',
            'CHECK_ADDON_STATUS'
        ]
    },

    // Streaming errors (4xxx)
    STREAM_NOT_FOUND: {
        code: 4000,
        title: 'STREAM_NOT_FOUND_TITLE',
        message: 'STREAM_NOT_FOUND_MESSAGE',
        severity: 'error',
        recoverable: true,
        suggestions: [
            'TRY_DIFFERENT_STREAM',
            'CHECK_ADDONS',
            'SEARCH_ALTERNATIVE'
        ]
    },
    STREAM_LOAD_FAILED: {
        code: 4001,
        title: 'STREAM_LOAD_FAILED_TITLE',
        message: 'STREAM_LOAD_FAILED_MESSAGE',
        severity: 'error',
        recoverable: true,
        suggestions: [
            'CHECK_INTERNET_SPEED',
            'TRY_EXTERNAL_PLAYER',
            'TRY_DIFFERENT_QUALITY'
        ]
    },
    TORRENT_PARSE_FAILED: {
        code: 4002,
        title: 'TORRENT_PARSE_FAILED_TITLE',
        message: 'TORRENT_PARSE_FAILED_MESSAGE',
        severity: 'error',
        recoverable: true,
        suggestions: [
            'CHECK_FILE_FORMAT',
            'DOWNLOAD_AGAIN'
        ]
    },

    // Library errors (5xxx)
    LIBRARY_SYNC_FAILED: {
        code: 5000,
        title: 'LIBRARY_SYNC_FAILED_TITLE',
        message: 'LIBRARY_SYNC_FAILED_MESSAGE',
        severity: 'warning',
        recoverable: true,
        suggestions: [
            'CHECK_LOGIN_STATUS',
            'TRY_MANUAL_SYNC'
        ]
    },

    // Storage errors (6xxx)
    STORAGE_FULL: {
        code: 6000,
        title: 'STORAGE_FULL_TITLE',
        message: 'STORAGE_FULL_MESSAGE',
        severity: 'warning',
        recoverable: true,
        suggestions: [
            'CLEAR_CACHE',
            'CLEAR_DATA'
        ]
    },
    STORAGE_ACCESS_DENIED: {
        code: 6001,
        title: 'STORAGE_ACCESS_DENIED_TITLE',
        message: 'STORAGE_ACCESS_DENIED_MESSAGE',
        severity: 'error',
        recoverable: false,
        suggestions: [
            'CHECK_BROWSER_PERMISSIONS'
        ]
    },

    // Generic errors (9xxx)
    UNKNOWN_ERROR: {
        code: 9000,
        title: 'UNKNOWN_ERROR_TITLE',
        message: 'UNKNOWN_ERROR_MESSAGE',
        severity: 'error',
        recoverable: true,
        suggestions: [
            'RELOAD_PAGE',
            'CLEAR_DATA',
            'CONTACT_SUPPORT'
        ]
    }
};

/**
 * Maps error types and codes to enhanced error information
 */
const mapErrorToCode = (error) => {
    // Handle network errors
    if (!navigator.onLine) {
        return ERROR_CODES.OFFLINE;
    }

    if (error.message?.toLowerCase().includes('network') ||
        error.message?.toLowerCase().includes('fetch')) {
        return ERROR_CODES.NETWORK_ERROR;
    }

    if (error.message?.toLowerCase().includes('timeout')) {
        return ERROR_CODES.CONNECTION_TIMEOUT;
    }

    // Handle addon errors
    if (error.type === 'Other' && error.code === 3) {
        return ERROR_CODES.ADDON_INSTALL_FAILED;
    }

    // Handle streaming errors
    if (error.code === 2) {
        return ERROR_CODES.STREAM_LOAD_FAILED;
    }

    // Handle authentication errors
    if (error.message?.toLowerCase().includes('auth') ||
        error.message?.toLowerCase().includes('unauthorized')) {
        return ERROR_CODES.AUTH_FAILED;
    }

    // Handle storage errors
    if (error.message?.toLowerCase().includes('quota') ||
        error.message?.toLowerCase().includes('storage')) {
        return ERROR_CODES.STORAGE_FULL;
    }

    // Default to unknown error
    return ERROR_CODES.UNKNOWN_ERROR;
};

module.exports = {
    ERROR_CODES,
    mapErrorToCode
};
