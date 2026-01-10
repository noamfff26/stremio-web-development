// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const { useTranslation } = require('react-i18next');
const classnames = require('classnames');
const { default: Icon } = require('@stremio/stremio-icons/react');
const styles = require('./styles');

const NetworkStatus = () => {
    const { t } = useTranslation();
    const [isOnline, setIsOnline] = React.useState(navigator.onLine);
    const [wasOffline, setWasOffline] = React.useState(false);
    const [showReconnected, setShowReconnected] = React.useState(false);

    React.useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            if (wasOffline) {
                setShowReconnected(true);
                setTimeout(() => {
                    setShowReconnected(false);
                    setWasOffline(false);
                }, 3000);
            }
        };

        const handleOffline = () => {
            setIsOnline(false);
            setWasOffline(true);
            setShowReconnected(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [wasOffline]);

    if (isOnline && !showReconnected) {
        return null;
    }

    return (
        <div className={classnames(styles['network-status'], {
            [styles['offline']]: !isOnline,
            [styles['reconnected']]: showReconnected
        })}>
            <Icon
                className={styles['icon']}
                name={isOnline ? 'ic_check' : 'ic_warning'}
            />
            <div className={styles['message']}>
                {isOnline ? t('NETWORK_RECONNECTED') : t('NETWORK_OFFLINE')}
            </div>
        </div>
    );
};

module.exports = NetworkStatus;
