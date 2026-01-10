// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const { useTranslation } = require('react-i18next');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const { default: Icon } = require('@stremio/stremio-icons/react');
const { Image, Button } = require('stremio/components');
const { useServices } = require('stremio/services');
const { mapErrorToCode } = require('stremio/common/ErrorHandler');
const styles = require('./styles');

const ErrorDialog = ({ className }) => {
    const { t } = useTranslation();
    const { core } = useServices();

    const [dataCleared, setDataCleared] = React.useState(false);
    const [showDetails, setShowDetails] = React.useState(false);

    const errorInfo = React.useMemo(() => {
        if (core.error instanceof Error) {
            return mapErrorToCode(core.error);
        }
        return null;
    }, [core.error]);

    const reload = React.useCallback(() => {
        window.location.reload();
    }, []);

    const clearData = React.useCallback(() => {
        window.localStorage.clear();
        setDataCleared(true);
    }, []);

    const toggleDetails = React.useCallback(() => {
        setShowDetails(prev => !prev);
    }, []);
    return (
        <div className={classnames(className, styles['error-container'])}>
            <div className={styles['error-icon-container']}>
                <Icon className={styles['error-icon']} name={'ic_warning'} />
            </div>
            <div className={styles['error-title']}>
                {errorInfo ? t(errorInfo.title) : t('GENERIC_ERROR_TITLE')}
            </div>
            <div className={styles['error-message']}>
                {errorInfo ? t(errorInfo.message) : t('GENERIC_ERROR_MESSAGE')}
            </div>
            {
                errorInfo && errorInfo.code ?
                    <div className={styles['error-code']}>
                        {t('ERROR_CODE')}: {errorInfo.code}
                    </div>
                    :
                    null
            }
            {
                errorInfo && errorInfo.suggestions && errorInfo.suggestions.length > 0 ?
                    <div className={styles['suggestions-container']}>
                        <div className={styles['suggestions-title']}>
                            {t('SUGGESTIONS_TITLE')}:
                        </div>
                        <ul className={styles['suggestions-list']}>
                            {errorInfo.suggestions.map((suggestion, index) => (
                                <li key={index} className={styles['suggestion-item']}>
                                    {t(suggestion)}
                                </li>
                            ))}
                        </ul>
                    </div>
                    :
                    null
            }
            <div className={styles['buttons-container']}>
                <Button className={styles['button-container']} title={t('TRY_AGAIN')} onClick={reload}>
                    <div className={styles['label']}>
                        {t('TRY_AGAIN')}
                    </div>
                </Button>
                <Button className={styles['button-container']} disabled={dataCleared} title={t('CLEAR_DATA')} onClick={clearData}>
                    <div className={styles['label']}>
                        {t('CLEAR_DATA')}
                    </div>
                </Button>
            </div>
            {
                core.error instanceof Error ?
                    <Button className={styles['details-toggle']} onClick={toggleDetails}>
                        <div className={styles['label']}>
                            {showDetails ? t('HIDE_DETAILS') : t('SHOW_DETAILS')}
                        </div>
                    </Button>
                    :
                    null
            }
            {
                showDetails && core.error instanceof Error ?
                    <div className={styles['error-details']}>
                        <pre className={styles['error-stack']}>
                            {core.error.stack || core.error.message}
                        </pre>
                    </div>
                    :
                    null
            }
        </div>
    );
};

ErrorDialog.displayName = 'ErrorDialog';

ErrorDialog.propTypes = {
    className: PropTypes.string
};

module.exports = ErrorDialog;
