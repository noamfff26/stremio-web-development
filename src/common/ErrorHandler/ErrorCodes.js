// Copyright (C) 2017-2023 Smart code 203358507

/**
 * Enhanced error code system for better user feedback
 */

const ERROR_CODES = {
    // Network errors (1xxx)
    NETWORK_ERROR: {
        code: 1000,
        title: 'שגיאת רשת',
        message: 'אין אפשרות להתחבר לשרת. אנא בדוק את החיבור לאינטרנט.',
        severity: 'error',
        recoverable: true,
        suggestions: [
            'בדוק את החיבור לאינטרנט',
            'נסה שוב מאוחר יותר',
            'בדוק הגדרות חומת אש'
        ]
    },
    CONNECTION_TIMEOUT: {
        code: 1001,
        title: 'תם זמן החיבור',
        message: 'החיבור לשרת ארך זמן רב מדי.',
        severity: 'error',
        recoverable: true,
        suggestions: [
            'בדוק את מהירות האינטרנט',
            'נסה שוב'
        ]
    },
    OFFLINE: {
        code: 1002,
        title: 'אין חיבור לאינטרנט',
        message: 'נראה שאינך מחובר לאינטרנט.',
        severity: 'warning',
        recoverable: true,
        suggestions: [
            'התחבר לאינטרנט'
        ]
    },

    // Authentication errors (2xxx)
    AUTH_FAILED: {
        code: 2000,
        title: 'שגיאת אימות',
        message: 'פרטי ההתחברות שגויים.',
        severity: 'error',
        recoverable: true,
        suggestions: [
            'בדוק את שם המשתמש והסיסמה',
            'אפס את הסיסמה'
        ]
    },
    SESSION_EXPIRED: {
        code: 2001,
        title: 'פג תוקף ההתחברות',
        message: 'פג תוקף ההתחברות שלך.',
        severity: 'warning',
        recoverable: true,
        suggestions: [
            'התחבר שוב'
        ]
    },

    // Addon errors (3xxx)
    ADDON_INSTALL_FAILED: {
        code: 3000,
        title: 'התקנת התוסף נכשלה',
        message: 'לא ניתן להתקין את התוסף. אנא בדוק את כתובת ה-URL ונסה שוב.',
        severity: 'error',
        recoverable: true,
        suggestions: [
            'בדוק את כתובת התוסף',
            'נסה תוסף אחר',
            'צור קשר עם מפתח התוסף'
        ]
    },
    ADDON_LOAD_FAILED: {
        code: 3001,
        title: 'טעינת התוסף נכשלה',
        message: 'לא ניתן לטעון את התוסף.',
        severity: 'error',
        recoverable: true,
        suggestions: [
            'התקן מחדש את התוסף',
            'בדוק את מצב התוסף'
        ]
    },

    // Streaming errors (4xxx)
    STREAM_NOT_FOUND: {
        code: 4000,
        title: 'לא נמצא stream',
        message: 'לא נמצאו מקורות זמינים לתוכן זה.',
        severity: 'error',
        recoverable: true,
        suggestions: [
            'נסה stream אחר',
            'בדוק את התוספים',
            'חפש חלופה'
        ]
    },
    STREAM_LOAD_FAILED: {
        code: 4001,
        title: 'טעינת Stream נכשלה',
        message: 'אירעה שגיאה בעת טעינת הווידאו.',
        severity: 'error',
        recoverable: true,
        suggestions: [
            'בדוק את מהירות האינטרנט',
            'נסה נגן חיצוני',
            'נסה איכות אחרת'
        ]
    },
    TORRENT_PARSE_FAILED: {
        code: 4002,
        title: 'שגיאה בקריאת Torrent',
        message: 'לא ניתן לקרוא את קובץ ה-Torrent.',
        severity: 'error',
        recoverable: true,
        suggestions: [
            'בדוק את פורמט הקובץ',
            'הורד שוב'
        ]
    },

    // Library errors (5xxx)
    LIBRARY_SYNC_FAILED: {
        code: 5000,
        title: 'סנכרון הספרייה נכשל',
        message: 'לא ניתן לסנכרן את הספרייה שלך.',
        severity: 'warning',
        recoverable: true,
        suggestions: [
            'בדוק את מצב ההתחברות',
            'נסה סנכרון ידני'
        ]
    },

    // Storage errors (6xxx)
    STORAGE_FULL: {
        code: 6000,
        title: 'האחסון מלא',
        message: 'אין מספיק מקום באחסון.',
        severity: 'warning',
        recoverable: true,
        suggestions: [
            'נקה את המטמון',
            'מחק נתונים'
        ]
    },
    STORAGE_ACCESS_DENIED: {
        code: 6001,
        title: 'הגישה לאחסון נדחתה',
        message: 'אין הרשאה לגשת לאחסון.',
        severity: 'error',
        recoverable: false,
        suggestions: [
            'בדוק הרשאות הדפדפן'
        ]
    },

    // Generic errors (9xxx)
    UNKNOWN_ERROR: {
        code: 9000,
        title: 'אירעה שגיאה',
        message: 'אירעה שגיאה לא צפויה. אנא נסה שוב.',
        severity: 'error',
        recoverable: true,
        suggestions: [
            'טען מחדש את הדף',
            'נקה נתונים',
            'פנה לתמיכה'
        ]
    }
};

/**
 * Maps error types and codes to enhanced error information
 */
const mapErrorToCode = (error) => {
    // Safety check - ensure error exists
    if (!error) {
        return ERROR_CODES.UNKNOWN_ERROR;
    }

    // Handle network errors
    if (!navigator.onLine) {
        return ERROR_CODES.OFFLINE;
    }

    // Get error message safely
    const errorMessage = String(error.message || error.toString?.() || '').toLowerCase();

    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        return ERROR_CODES.NETWORK_ERROR;
    }

    if (errorMessage.includes('timeout')) {
        return ERROR_CODES.CONNECTION_TIMEOUT;
    }

    // Handle addon errors - filter out non-critical errors (code 3 and 4)
    if (error.type === 'Other' && (error.code === 3 || error.code === 4)) {
        // Return null for non-critical addon errors to prevent display
        return null;
    }

    // Handle streaming errors
    if (error.code === 2) {
        return ERROR_CODES.STREAM_LOAD_FAILED;
    }

    // Handle authentication errors
    if (errorMessage.includes('auth') || errorMessage.includes('unauthorized')) {
        return ERROR_CODES.AUTH_FAILED;
    }

    // Handle storage errors
    if (errorMessage.includes('quota') || errorMessage.includes('storage')) {
        return ERROR_CODES.STORAGE_FULL;
    }

    // Default to unknown error
    return ERROR_CODES.UNKNOWN_ERROR;
};

module.exports = {
    ERROR_CODES,
    mapErrorToCode
};
