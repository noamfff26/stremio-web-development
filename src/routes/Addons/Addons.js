// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const { useTranslation } = require('react-i18next');
const { default: Icon } = require('@stremio/stremio-icons/react');
const { usePlatform, useBinaryState, withCoreSuspender, useToast } = require('stremio/common');
const { DEFAULT_ADDONS } = require('stremio/common/addonsConfig');
const { removeAddons, installDefaultAddons } = require('stremio/common/addonInstaller');
const { AddonDetailsModal, Button, Image, MainNavBars, ModalDialog, SearchBar, SharePrompt, TextInput, MultiselectMenu, Checkbox } = require('stremio/components');
const { useServices } = require('stremio/services');
const Addon = require('./Addon');
const useInstalledAddons = require('./useInstalledAddons');
const useRemoteAddons = require('./useRemoteAddons');
const useAddonDetailsTransportUrl = require('./useAddonDetailsTransportUrl');
const useSelectableInputs = require('./useSelectableInputs');
const styles = require('./styles');
const { AddonPlaceholder } = require('./AddonPlaceholder');

function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const finalOptions = Object.assign({}, options || {}, { signal: controller.signal });
  return fetch(url, finalOptions).finally(() => clearTimeout(timer));
}


const Addons = ({ urlParams, queryParams }) => {
    const { t } = useTranslation();
    const platform = usePlatform();
    const { core } = useServices();
    const toast = useToast();
    const installedAddons = useInstalledAddons(urlParams);
    const remoteAddons = useRemoteAddons(urlParams);
    const [addonDetailsTransportUrl, setAddonDetailsTransportUrl] = useAddonDetailsTransportUrl(urlParams, queryParams);
    const selectInputs = useSelectableInputs(installedAddons, remoteAddons);
    const [filtersModalOpen, openFiltersModal, closeFiltersModal] = useBinaryState(false);
    const [addAddonModalOpen, openAddAddonModal, closeAddAddonModal] = useBinaryState(false);
    const [installAllModalOpen, openInstallAllModal, closeInstallAllModal] = useBinaryState(false);
    const [cleanInstallSelected, setCleanInstallSelected] = React.useState(true);
    const addAddonUrlInputRef = React.useRef(null);
    const addAddonOnSubmit = React.useCallback(() => {
        if (addAddonUrlInputRef.current !== null) {
            setAddonDetailsTransportUrl(addAddonUrlInputRef.current.value);
        }
    }, [setAddonDetailsTransportUrl]);
    const addAddonModalButtons = React.useMemo(() => {
        return [
            {
                className: styles['cancel-button'],
                label: t('BUTTON_CANCEL'),
                props: {
                    onClick: closeAddAddonModal
                }
            },
            {
                label: t('ADDON_ADD'),
                props: {
                    onClick: addAddonOnSubmit
                }
            }
        ];
    }, [addAddonOnSubmit]);
    const [search, setSearch] = React.useState('');
    const searchInputOnChange = React.useCallback((event) => {
        setSearch(event.currentTarget.value);
    }, []);
    const [sharedAddon, setSharedAddon] = React.useState(null);
    const clearSharedAddon = React.useCallback(() => {
        setSharedAddon(null);
    }, []);
    const onAddonShare = React.useCallback((event) => {
        setSharedAddon(event.dataset.addon);
    }, []);
    const onAddonInstall = React.useCallback((event) => {
        core.transport.dispatch({
            action: 'Ctx',
            args: {
                action: 'InstallAddon',
                args: event.dataset.addon,
            }
        });
    }, []);
    const onAddonUninstall = React.useCallback((event) => {
        core.transport.dispatch({
            action: 'Ctx',
            args: {
                action: 'UninstallAddon',
                args: event.dataset.addon,
            }
        });
    }, []);
    const onAddonConfigure = React.useCallback((event) => {
        platform.openExternal(event.dataset.addon.transportUrl.replace('manifest.json', 'configure'));
    }, []);
    const onAddonOpen = React.useCallback((event) => {
        setAddonDetailsTransportUrl(event.dataset.addon.transportUrl);
    }, [setAddonDetailsTransportUrl]);

    const toggleCleanInstall = React.useCallback(() => {
        setCleanInstallSelected(prev => !prev);
    }, []);

const [installingAll, setInstallingAll] = React.useState(false);
    const [installProgressIndex, setInstallProgressIndex] = React.useState(0);
    // install choice modal removed in favor of a simple confirm prompt
    const [installChoice, setInstallChoice] = React.useState('keep');

    const confirmInstallAllAddons = React.useCallback(async () => {
        // Prompt user to choose whether to remove existing addons or keep them
        try {
            const removeBeforeInstall = window.confirm('הסר תוספים קיימים לפני ההתקנה?');
            const choice = removeBeforeInstall ? 'remove' : 'keep';
            await performInstallAllAddons(choice);
        } catch (e) {
            console.error(e);
        }
    }, [performInstallAllAddons]);
    const performInstallAllAddons = React.useCallback(async (choice) => {
        // Perform installation with chosen option (remove or keep existing addons)
        // no modal; proceeding with install
        setInstallingAll(true);
        setInstallProgressIndex(0);
        try {
            if (choice === 'remove') {
                console.warn('[Addons] Starting addon removal...');
                await removeAddons(core);
                console.warn('[Addons] Addon removal complete');
            }

            console.warn('[Addons] Starting default addon installation (sequential)...');

            const total = DEFAULT_ADDONS.length;
            let successCount = 0;
            let failCount = 0;
            const failedUrls = [];

            for (let i = 0; i < total; i++) {
                const addonUrl = DEFAULT_ADDONS[i];
                setInstallProgressIndex(i + 1);
                try {
                    console.warn('[AddonInstaller] Fetching (sequential):', addonUrl);

                    let response = await fetchWithTimeout(addonUrl, { method: 'GET', headers: { 'Accept': 'application/json' } }, 10000);
                    if (!response.ok && !/manifest\\.json$/.test(addonUrl)) {
                        const urlWithManifest = addonUrl.replace(/\\/+$/, '') + '/manifest.json';
                        console.warn('[AddonInstaller] Retrying with:', urlWithManifest);
                        try { response = await fetchWithTimeout(urlWithManifest, { method: 'GET', headers: { 'Accept': 'application/json' } }, 10000); } catch(e) { console.warn('[AddonInstaller] Retry failed', e.message); }
                    }

                    if (!response || !response.ok) {
                        console.warn('[AddonInstaller] Failed to fetch after retry:', addonUrl, response && response.status);
                        failCount++;
                        failedUrls.push(addonUrl);
                        continue;
                    }

                    let manifest;
                    try { manifest = await response.json(); } catch (err) { console.warn('[AddonInstaller] JSON parse error:', addonUrl, err.message); failCount++; failedUrls.push(addonUrl); continue; }

                    if (!manifest || !manifest.id || !manifest.name) {
                        console.warn('[AddonInstaller] Invalid manifest:', addonUrl);
                        failCount++;
                        failedUrls.push(addonUrl);
                        continue;
                    }

                    console.warn('[AddonInstaller] Installing:', manifest.name);
                    core.transport.dispatch({ action: 'Ctx', args: { action: 'InstallAddon', args: { transportUrl: addonUrl, manifest } } });

                    await new Promise(r => setTimeout(r, 600));
                    successCount++;
                } catch (error) {
                    console.warn('[AddonInstaller] Error installing:', addonUrl, error.message);
                    failCount++;
                    failedUrls.push(addonUrl);
                }
            }

            console.warn('[Addons] Sequential installation complete', { successCount, failCount });
            toast.show({ type: 'success', title: `התקנה הושלמה: ${successCount} הצלחות, ${failCount} נכשלו`, timeout: 6000 });
        } catch (error) {
            console.error('[Addons] Error during addon setup:', error);
            toast.show({ type: 'error', title: 'שגיאה בהתקנת התוספים', timeout: 4000 });
        } finally {
            setInstallingAll(false);
            setInstallProgressIndex(0);
            closeInstallAllModal();
        }
    }, [core, DEFAULT_ADDONS, removeAddons, toast]);

    const installAllModalButtons = React.useMemo(() => {

        return [
            {
                className: styles['cancel-button'],
                label: 'ביטול',
                props: {
                    onClick: closeInstallAllModal,
                    disabled: installingAll
                }
            },
            {
                className: styles['confirm-button'],
                label: 'התקן',
                props: {
                    onClick: confirmInstallAllAddons,
                    disabled: installingAll
                }
            }
        ];
    }, [confirmInstallAllAddons, closeInstallAllModal]);
    const onInstallAllDefaultAddons = React.useCallback(() => {
        openInstallAllModal();
    }, []);
    const closeAddonDetails = React.useCallback(() => {
        setAddonDetailsTransportUrl(null);
    }, [setAddonDetailsTransportUrl]);
    const searchFilterPredicate = React.useCallback((addon) => {
        return search.length === 0 ||
            (
                (typeof addon.manifest.name === 'string' && addon.manifest.name.toLowerCase().includes(search.toLowerCase())) ||
                (typeof addon.manifest.description === 'string' && addon.manifest.description.toLowerCase().includes(search.toLowerCase()))
            );
    }, [search]);
    const renderLogoFallback = React.useCallback(() => (
        <Icon className={styles['icon']} name={'addons'} />
    ), []);
    React.useLayoutEffect(() => {
        closeAddAddonModal();
        setSearch('');
        clearSharedAddon();
    }, [urlParams, queryParams]);
    return (
        <MainNavBars className={styles['addons-container']} route={'addons'}>
            <div className={styles['addons-content']}>
                <div className={styles['selectable-inputs-container']}>
                    {selectInputs.map((selectInput, index) => (
                        <MultiselectMenu
                            {...selectInput}
                            key={index}
                            className={styles['select-input-container']}
                        />
                    ))}
                    <div className={styles['spacing']} />
                     <Button className={styles['add-button-container']} title={t('ADD_ADDON')} onClick={openAddAddonModal}>
                         <Icon className={styles['icon']} name={'add'} />
                         <div className={styles['add-button-label']}>{t('ADD_ADDON')}</div>
                     </Button>
                    <SearchBar
                        className={styles['search-bar']}
                        title={t('ADDON_SEARCH')}
                        value={search}
                        onChange={searchInputOnChange}
                    />
                    <Button className={styles['filter-button']} title={t('ALL_FILTERS')} onClick={openFiltersModal}>
                        <Icon className={styles['filter-icon']} name={'filters'} />
                    </Button>
                </div>
                {
                    installedAddons.selected !== null ?
                        installedAddons.selectable.types.length === 0 ?
                            <div className={styles['message-container']}>
                                {t('NO_ADDONS')}
                            </div>
                            :
                            installedAddons.catalog.length === 0 ?
                                <div className={styles['message-container']}>
                                    {t('NO_ADDONS_FOR_TYPE')}
                                </div>
                                :
                                <div className={styles['addons-list-container']}>
                                    {
                                        installedAddons.catalog
                                            .filter(searchFilterPredicate)
                                            .map((addon, index) => (
                                                <Addon
                                                    key={index}
                                                    className={classnames(styles['addon'], 'animation-fade-in')}
                                                    id={addon.manifest.id}
                                                    name={addon.manifest.name}
                                                    version={addon.manifest.version}
                                                    logo={addon.manifest.logo}
                                                    description={addon.manifest.description}
                                                    types={addon.manifest.types}
                                                    behaviorHints={addon.manifest.behaviorHints}
                                                    installed={addon.installed}
                                                    onInstall={onAddonInstall}
                                                    onUninstall={onAddonUninstall}
                                                    onConfigure={onAddonConfigure}
                                                    onOpen={onAddonOpen}
                                                    onShare={onAddonShare}
                                                    dataset={{ addon }}
                                                />
                                            ))
                                    }
                                </div>
                        :
                        remoteAddons.selected !== null ?
                            remoteAddons.catalog.content.type === 'Err' ?
                                <div className={styles['message-container']}>
                                    {remoteAddons.catalog.content.content}
                                </div>
                                :
                                remoteAddons.catalog.content.type === 'Loading' ?
                                    <div className={styles['addons-list-container']}>
                                        {Array.from({ length: 6 }).map((_, index) => (
                                            <AddonPlaceholder key={index} className={styles['addon']} />
                                        ))}
                                    </div>
                                    :
                                    <div className={styles['addons-list-container']}>
                                        {
                                            remoteAddons.catalog.content.content
                                                .filter(searchFilterPredicate)
                                                .map((addon, index) => (
                                                    <Addon
                                                        key={index}
                                                        className={classnames(styles['addon'], 'animation-fade-in')}
                                                        id={addon.manifest.id}
                                                        name={addon.manifest.name}
                                                        version={addon.manifest.version}
                                                        logo={addon.manifest.logo}
                                                        description={addon.manifest.description}
                                                        types={addon.manifest.types}
                                                        behaviorHints={addon.manifest.behaviorHints}
                                                        installed={addon.installed}
                                                        onInstall={onAddonInstall}
                                                        onUninstall={onAddonUninstall}
                                                        onConfigure={onAddonConfigure}
                                                        onOpen={onAddonOpen}
                                                        onShare={onAddonShare}
                                                        dataset={{ addon }}
                                                    />
                                                ))
                                        }
                                    </div>
                            :
                            <div className={styles['addons-list-container']}>
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <AddonPlaceholder key={index} className={styles['addon']} />
                                ))}
                            </div>
                }
            </div>
            {
                filtersModalOpen ?
                    <ModalDialog title={t('ADDONS_FILTERS')} className={styles['filters-modal']} onCloseRequest={closeFiltersModal}>
                        {selectInputs.map((selectInput, index) => (
                            <MultiselectMenu
                                {...selectInput}
                                key={index}
                                className={styles['select-input-container']}
                            />
                        ))}
                    </ModalDialog>
                    :
                    null
            }
            {
                addAddonModalOpen ?
                    <ModalDialog
                        className={styles['add-addon-modal-container']}
                        title={t('ADD_ADDON')}
                        buttons={addAddonModalButtons}
                        onCloseRequest={closeAddAddonModal}>
                        <div className={styles['notice']}>{t('ADD_ADDON_DESCRIPTION')}</div>
                        <TextInput
                            ref={addAddonUrlInputRef}
                            className={styles['addon-url-input']}
                            type={'text'}
                            placeholder={t('PASTE_ADDON_URL')}
                            autoFocus={true}
                            onSubmit={addAddonOnSubmit}
                        />
                    </ModalDialog>
                    :
                    null
            }
            {
            installAllModalOpen ?
                    <ModalDialog
                        className={styles['install-all-modal-container']}
                        title={'התקן את כל התוספים'}
                        buttons={installAllModalButtons}
                        onCloseRequest={closeInstallAllModal}>
                        { installingAll ?
                            <div style={{ padding: '1rem 0', textAlign: 'center' }}>
                                <div style={{ marginBottom: '0.75rem', fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary-foreground-color)' }}>
                                    מתקין תוספים — {installProgressIndex} / {DEFAULT_ADDONS.length}
                                </div>
                                <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '8px', margin: '0 2rem' }}>
                                    <div style={{ width: `${Math.round((installProgressIndex / DEFAULT_ADDONS.length) * 100)}%`, height: '100%', background: 'var(--secondary-accent-color)', borderRadius: '8px' }} />
                                </div>
                                <div style={{ marginTop: '0.75rem', fontSize: '0.95rem', color: 'rgba(255,255,255,0.75)' }}>
                                    אל תסגור את החלון — ההתקנה תתבצע בשקט.
                                </div>
                            </div>
                            :
                            <>
                                <div className={styles['notice']}>
                                    <div style={{ marginBottom: '1rem', fontSize: '1.1rem', lineHeight: '1.6' }}>
                                        פעולה זו תתקין {DEFAULT_ADDONS.length} תוספים מומלצים לשימוש מיטבי באפליקציה.
                                    </div>
                                    <div style={{ fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                                        התוספים כוללים: קטלוגים, כתוביות בעברית, ומקורות סטרימינג.
                                    </div>
                                </div>
                                <Checkbox
                                    label={'הסר תוספים קיימים לפני ההתקנה (מומלץ)'}
                                    checked={cleanInstallSelected}
                                    onChange={toggleCleanInstall}
                                />
                            </>
                        }
                    </ModalDialog>
                    :
                    null
            }

            {
                sharedAddon !== null ?
                    <ModalDialog
                        className={styles['share-modal-container']}
                        title={t('SHARE_ADDON')}
                        onCloseRequest={clearSharedAddon}>
                        <div className={styles['title-container']}>
                            <Image
                                className={styles['logo']}
                                src={sharedAddon.manifest.logo}
                                alt={' '}
                                renderFallback={renderLogoFallback}
                            />
                            <div className={styles['name-container']}>
                                <span className={styles['name']}>{typeof sharedAddon.manifest.name === 'string' && sharedAddon.manifest.name.length > 0 ? sharedAddon.manifest.name : sharedAddon.manifest.id}</span>
                                {
                                    typeof sharedAddon.manifest.version === 'string' && sharedAddon.manifest.version.length > 0 ?
                                        <span className={styles['version']}>{t('ADDON_VERSION_SHORT', { version: sharedAddon.manifest.version })}</span>
                                        :
                                        null
                                }
                            </div>
                        </div>
                        <SharePrompt
                            className={styles['share-prompt-container']}
                            url={sharedAddon.transportUrl}
                        />
                    </ModalDialog>
                    :
                    null
            }
            {
                typeof addonDetailsTransportUrl === 'string' ?
                    <AddonDetailsModal
                        transportUrl={addonDetailsTransportUrl}
                        onCloseRequest={closeAddonDetails}
                    />
                    :
                    null
            }
        </MainNavBars>
    );
};

Addons.propTypes = {
    urlParams: PropTypes.shape({
        path: PropTypes.string,
        transportUrl: PropTypes.string,
        catalogId: PropTypes.string,
        type: PropTypes.string
    }),
    queryParams: PropTypes.instanceOf(URLSearchParams)
};

const AddonsFallback = () => (
    <MainNavBars className={styles['addons-container']} route={'addons'} />
);

module.exports = withCoreSuspender(Addons, AddonsFallback);
