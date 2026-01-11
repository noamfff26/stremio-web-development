// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const { useServices } = require('stremio/services');
const { useToast } = require('stremio/common');
const { ErrorHandler } = require('stremio/common/ErrorHandler');

const ServicesToaster = () => {
    const { core, dragAndDrop } = useServices();
    const toast = useToast();
    const errorHandler = React.useMemo(() => new ErrorHandler(toast), [toast]);

    React.useEffect(() => {
        const onCoreEvent = ({ event, args }) => {
            switch (event) {
                case 'Error': {
                    if (args.source.event === 'UserPulledFromAPI' && args.source.args.uid === null) {
                        break;
                    }

                    if (args.source.event === 'LibrarySyncWithAPIPlanned' && args.source.args.uid === null) {
                        break;
                    }

                    // Filter out non-critical AddonInstalled errors (code 3 and 4) - these are often false positives
                    // where installation succeeds despite the error event
                    if (args.error.type === 'Other' && (args.error.code === 3 || args.error.code === 4) && args.source.event === 'AddonInstalled') {
                        // Log the filtered error for debugging but don't show to user
                        console.warn('[ServicesToaster] Filtering non-critical addon installation error:', args.error);
                        break;
                    }

                    // Use enhanced error handler
                    errorHandler.showToast(
                        args.error,
                        {
                            type: 'CoreEvent',
                            source: args.source.event
                        },
                        {
                            timeout: 6000,
                            onRetry: () => {
                                // Auto-retry logic based on event type
                                if (args.source.event === 'AddonInstalled') {
                                    core.transport.dispatch({
                                        action: 'Ctx',
                                        args: {
                                            action: 'InstallAddon',
                                            args: args.source.args
                                        }
                                    });
                                }
                            }
                        }
                    );
                    break;
                }
                case 'TorrentParsed': {
                    toast.show({
                        type: 'success',
                        title: 'Torrent file parsed',
                        timeout: 4000
                    });
                    break;
                }
                case 'MagnetParsed': {
                    toast.show({
                        type: 'success',
                        title: 'Magnet link parsed',
                        timeout: 4000
                    });
                    break;
                }
                case 'PlayingOnDevice': {
                    toast.show({
                        type: 'success',
                        title: `Stream opened in ${args.device}`,
                        timeout: 4000
                    });
                    break;
                }
            }
        };
        const onDragAndDropError = (error) => {
            toast.show({
                type: 'error',
                title: error.message,
                message: error.file?.name,
                timeout: 4000
            });
        };
        core.transport.on('CoreEvent', onCoreEvent);
        dragAndDrop.on('error', onDragAndDropError);
        return () => {
            core.transport.off('CoreEvent', onCoreEvent);
            dragAndDrop.off('error', onDragAndDropError);
        };
    }, []);
    return null;
};

module.exports = ServicesToaster;
