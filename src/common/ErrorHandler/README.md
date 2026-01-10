# Enhanced Error Handling System

This directory contains the enhanced error handling system for Stremio Web, providing better user feedback and error recovery options.

## Components

### ErrorCodes.js
Defines structured error codes with:
- Error code numbers (organized by category)
- Localized title and message keys
- Severity levels (error, warning, info)
- Recoverability flags
- User-facing suggestions

### ErrorHandler.js
Main error handler class that:
- Maps errors to enhanced error information
- Maintains error history
- Shows toast notifications with proper formatting
- Supports retry actions for recoverable errors
- Logs errors for debugging

## Usage Examples

### Basic Error Handling

```javascript
const { ErrorHandler } = require('stremio/common/ErrorHandler');
const { useToast } = require('stremio/common');

const MyComponent = () => {
    const toast = useToast();
    const errorHandler = React.useMemo(() => new ErrorHandler(toast), [toast]);

    const handleAction = async () => {
        try {
            await someAsyncOperation();
        } catch (error) {
            errorHandler.showToast(error);
        }
    };
};
```

### Error Handling with Retry

```javascript
const handleAction = async () => {
    try {
        await installAddon(addonUrl);
    } catch (error) {
        errorHandler.showToast(
            error,
            { context: 'addon-installation' },
            {
                timeout: 6000,
                onRetry: () => {
                    // Retry the operation
                    handleAction();
                }
            }
        );
    }
};
```

### Custom Error Context

```javascript
errorHandler.showToast(
    new Error('Stream loading failed'),
    {
        streamUrl: 'https://...',
        addonName: 'My Addon'
    }
);
```

## Error Categories

- **1xxx**: Network errors (connection, timeout, offline)
- **2xxx**: Authentication errors (auth failed, session expired)
- **3xxx**: Addon errors (install failed, load failed)
- **4xxx**: Streaming errors (stream not found, load failed, torrent parse)
- **5xxx**: Library errors (sync failed)
- **6xxx**: Storage errors (quota exceeded, access denied)
- **9xxx**: Generic errors (unknown)

## Translation Keys

All error messages use i18next translation keys. Required keys:

### Error Titles
- `NETWORK_ERROR_TITLE`
- `CONNECTION_TIMEOUT_TITLE`
- `OFFLINE_TITLE`
- `AUTH_FAILED_TITLE`
- `SESSION_EXPIRED_TITLE`
- `ADDON_INSTALL_FAILED_TITLE`
- `STREAM_NOT_FOUND_TITLE`
- etc.

### Error Messages
- `NETWORK_ERROR_MESSAGE`
- `CONNECTION_TIMEOUT_MESSAGE`
- etc.

### Suggestions
- `CHECK_INTERNET_CONNECTION`
- `TRY_AGAIN_LATER`
- `CHECK_CREDENTIALS`
- `REINSTALL_ADDON`
- etc.

### UI Labels
- `ERROR_CODE`
- `SUGGESTIONS_TITLE`
- `TRY_AGAIN`
- `SHOW_DETAILS`
- `HIDE_DETAILS`

## Integration Points

The error handler is integrated into:

1. **ServicesToaster** - Handles Core events and shows enhanced error toasts
2. **ErrorDialog** - Shows detailed error information with suggestions
3. **NetworkStatus** - Monitors online/offline status
4. **Toast notifications** - Support action buttons for retry

## Best Practices

1. Always provide context when handling errors
2. Use retry actions for recoverable errors
3. Map generic errors to specific error codes when possible
4. Keep error messages user-friendly and actionable
5. Log detailed error information for debugging
