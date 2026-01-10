// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const { useTranslation } = require('react-i18next');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const { default: Icon } = require('@stremio/stremio-icons/react');
const { Modal, useRouteFocused } = require('stremio-router');
const { useServices } = require('stremio/services');
const { useBinaryState } = require('stremio/common');
const { Button, Image, Checkbox } = require('stremio/components');
const CredentialsTextInput = require('./CredentialsTextInput');
const PasswordResetModal = require('./PasswordResetModal');
const useFacebookLogin = require('./useFacebookLogin');
const { default: useAppleLogin } = require('./useAppleLogin');

const styles = require('./styles');

const SIGNUP_FORM = 'signup';
const LOGIN_FORM = 'login';

// Official Stremio addons to remove (installed by default on registration)
const OFFICIAL_ADDONS_TO_REMOVE = [
    'https://v3-cinemeta.strem.io/manifest.json',
    'https://opensubtitles-v3.strem.io/manifest.json',
    'https://watchhub.strem.io/manifest.json'
];

// Custom addons to install on signup
const DEFAULT_ADDONS = [
    'https://tmdb-addon.debridio.com/eyJhcGlfa2V5IjoiZGEwYmUxM2Y0YmI3YWJiOTZkMjA0NDFjOTc0ZDcyZTQiLCJsYW5ndWFnZSI6ImhlLUlMIiwicnBkYl9hcGkiOiIiLCJjYXRhbG9ncyI6W3siaWQiOiJkZWJyaWRpb190bWRiLm1vdmllX3RyZW5kaW5nIiwiaG9tZSI6dHJ1ZSwiZW5hYmxlZCI6dHJ1ZSwibmFtZSI6IlRyZW5kaW5nIn0seyJpZCI6ImRlYnJpZGlvX3RtZGIubW92aWVfcG9wdWxhciIsImhvbWUiOnRydWUsImVuYWJsZWQiOnRydWUsIm5hbWUiOiJQb3B1bGFyIn0seyJpZCI6ImRlYnJpZGlvX3RtZGIudHZfdHJlbmRpbmciLCJob21lIjp0cnVlLCJlbmFibGVkIjp0cnVlLCJuYW1lIjoiVHJlbmRpbmcifSx7ImlkIjoiZGVicmlkaW9fdG1kYi50dl9wb3B1bGFyIiwiaG9tZSI6dHJ1ZSwiZW5hYmxlZCI6dHJ1ZSwibmFtZSI6IlBvcHVsYXIifSx7ImlkIjoiZGVicmlkaW9fdG1kYi5zZWFyY2hfY29sbGVjdGlvbnMiLCJob21lIjpmYWxzZSwiZW5hYmxlZCI6dHJ1ZSwibmFtZSI6IlNlYXJjaCJ9XX0=/manifest.json',
    'https://stremio7rd-movies-online-dates.vercel.app/manifest.json',
    'https://4b139a4b7f94-wizdom-stremio-v2.baby-beamup.club/manifest.json',
    'https://4b139a4b7f94-ktuvit-stremio.baby-beamup.club/manifest.json',
    'https://opensubtitlesv3-pro.dexter21767.com/eyJsYW5ncyI6WyJoZWJyZXciXSwic291cmNlIjoiYWxsIiwiYWlUcmFuc2xhdGVkIjpmYWxzZSwiYXV0b0FkanVzdG1lbnQiOnRydWV9/manifest.json',
    'https://stremio7rd-hebrew-telegram-subtitles.vercel.app/manifest.json',
    'https://torrentio.strem.fun/providers=yts,eztv,rarbg,1337x,thepiratebay,kickasstorrents,torrentgalaxy,magnetdl,horriblesubs,nyaasi,tokyotosho,anidex|qualityfilter=threed,480p,other,scr,cam,unknown|limit=3|debridoptions=nodownloadlinks,nocatalog|easydebrid=n3cgfuzhg9ptzbss/manifest.json',
    'https://mediafusion.elfhosted.com/D-S4RKbSD6JlfWRL-nYnqDocUvZn3RmrM6w3UaZ3TjU3zqijJP3y_GrqGAcG5xr2wNu0yODlYouSyzp3wzYJoimzoq4vFMSzTiYbxb4F-zyEwvM8zYMWPS-Drwng6fHj4tmTFZLq_4Bp5ie3Py_swmm36Xfck9q6knYjoeVPfqd9eiGWSfQWfrttzbLiMKQ8u56MXS0bX2mVz5RNrWIu_9AG2UsgaEvIGwpJWAWSGf7-GrVU_9ITu_ZPfLPEH2Uc-oowauGtrBAAtD1VCYCrn5RTACSpvac7St8e5dcTtBh8ECX1Fyvxbyh0MJNc5k52TKx3MRGoe8bWb-UGSo7Ows_FiFjrMbqYZO5PEWHZaTxJtBtH218ZRXso1E713WS7mQdVn5sEGaFBN2irnHGbLjTmTPXEKH4_YuMyPQh8XnjvHo2aA9ouipSboLwUa88LqaxsEUiFzWNCH9K316IobNCyYSNlfhA35uaOgR6DuywPkYXRkKZvd--jISqNvz5dta5pd_9mNqCrBEchoMMkvwgUKaeBoqhgredRYJQATQ3gU/manifest.json'
];

// Function to remove official addons
const removeOfficialAddons = async (core) => {
    for (const addonUrl of OFFICIAL_ADDONS_TO_REMOVE) {
        try {
            const response = await fetch(addonUrl);
            const manifest = await response.json();
            core.transport.dispatch({
                action: 'Ctx',
                args: {
                    action: 'UninstallAddon',
                    args: {
                        transportUrl: addonUrl,
                        manifest
                    }
                }
            });
        } catch (error) {
            console.error('Failed to remove addon:', addonUrl, error);
        }
    }
};

// Function to install custom addons
const installDefaultAddons = async (core) => {
    for (const addonUrl of DEFAULT_ADDONS) {
        try {
            const response = await fetch(addonUrl);
            const manifest = await response.json();
            core.transport.dispatch({
                action: 'Ctx',
                args: {
                    action: 'InstallAddon',
                    args: {
                        transportUrl: addonUrl,
                        manifest
                    }
                }
            });
        } catch (error) {
            console.error('Failed to install addon:', addonUrl, error);
        }
    }
};

const Intro = ({ queryParams }) => {
    const { core } = useServices();
    const { t } = useTranslation();
    const routeFocused = useRouteFocused();
    const [startFacebookLogin, stopFacebookLogin] = useFacebookLogin();
    const [startAppleLogin, stopAppleLogin] = useAppleLogin();
    const emailRef = React.useRef(null);
    const passwordRef = React.useRef(null);
    const confirmPasswordRef = React.useRef(null);
    const termsRef = React.useRef(null);
    const privacyPolicyRef = React.useRef(null);
    const marketingRef = React.useRef(null);
    const errorRef = React.useRef(null);
    const isSigningUpRef = React.useRef(false);
    const [passwordRestModalOpen, openPasswordRestModal, closePasswordResetModal] = useBinaryState(false);
    const [loaderModalOpen, openLoaderModal, closeLoaderModal] = useBinaryState(false);
    const [state, dispatch] = React.useReducer(
        (state, action) => {
            switch (action.type) {
                case 'set-form':
                    if (state.form !== action.form) {
                        return {
                            form: action.form,
                            email: '',
                            password: '',
                            confirmPassword: '',
                            termsAccepted: false,
                            privacyPolicyAccepted: false,
                            marketingAccepted: false,
                            error: ''
                        };
                    }
                    return state;
                case 'change-credentials':
                    return {
                        ...state,
                        error: '',
                        [action.name]: action.value
                    };
                case 'toggle-checkbox':
                    return {
                        ...state,
                        error: '',
                        [action.name]: !state[action.name]
                    };
                case 'error':
                    return {
                        ...state,
                        error: action.error
                    };
                default:
                    return state;
            }
        },
        {
            form: [LOGIN_FORM, SIGNUP_FORM].includes(queryParams.get('form')) ? queryParams.get('form') : SIGNUP_FORM,
            email: '',
            password: '',
            confirmPassword: '',
            termsAccepted: false,
            privacyPolicyAccepted: false,
            marketingAccepted: false,
            error: ''
        }
    );
    const loginWithFacebook = React.useCallback(() => {
        openLoaderModal();
        startFacebookLogin()
            .then(({ email, password }) => {
                core.transport.dispatch({
                    action: 'Ctx',
                    args: {
                        action: 'Authenticate',
                        args: {
                            type: 'Login',
                            email,
                            password,
                            facebook: true
                        }
                    }
                });
            })
            .catch((error) => {
                closeLoaderModal();
                dispatch({ type: 'error', error: error.message });
            });
    }, []);
    const cancelLoginWithFacebook = React.useCallback(() => {
        stopFacebookLogin();
        closeLoaderModal();
    }, []);
    const loginWithApple = React.useCallback(() => {
        openLoaderModal();
        startAppleLogin()
            .then(({ token, sub, email, name }) => {
                core.transport.dispatch({
                    action: 'Ctx',
                    args: {
                        action: 'Authenticate',
                        args: {
                            type: 'Apple',
                            token,
                            sub,
                            email,
                            name
                        }
                    }
                });
            })
            .catch((error) => {
                closeLoaderModal();
                dispatch({ type: 'error', error: error.message });
            });
    }, []);
    const cancelLoginWithApple = React.useCallback(() => {
        stopAppleLogin();
        closeLoaderModal();
    }, []);
    const loginWithEmail = React.useCallback(() => {
        if (typeof state.email !== 'string' || state.email.length === 0 || !emailRef.current.validity.valid) {
            dispatch({ type: 'error', error: t('INVALID_EMAIL') });
            return;
        }
        if (typeof state.password !== 'string' || state.password.length === 0) {
            dispatch({ type: 'error', error: t('INVALID_PASSWORD') });
            return;
        }
        openLoaderModal();
        core.transport.dispatch({
            action: 'Ctx',
            args: {
                action: 'Authenticate',
                args: {
                    type: 'Login',
                    email: state.email,
                    password: state.password
                }
            }
        });
    }, [state.email, state.password]);
    const loginAsGuest = React.useCallback(() => {
        if (!state.termsAccepted) {
            dispatch({ type: 'error', error: t('MUST_ACCEPT_TERMS') });
            return;
        }
        window.location = '#/';
    }, [state.termsAccepted]);
    const signup = React.useCallback(() => {
        if (typeof state.email !== 'string' || state.email.length === 0 || !emailRef.current.validity.valid) {
            dispatch({ type: 'error', error: t('INVALID_EMAIL') });
            return;
        }
        if (typeof state.password !== 'string' || state.password.length === 0) {
            dispatch({ type: 'error', error: t('INVALID_PASSWORD') });
            return;
        }
        if (state.password !== state.confirmPassword) {
            dispatch({ type: 'error', error: t('PASSWORDS_NOMATCH') });
            return;
        }
        if (!state.termsAccepted) {
            dispatch({ type: 'error', error: t('MUST_ACCEPT_TERMS') });
            return;
        }
        if (!state.privacyPolicyAccepted) {
            dispatch({ type: 'error', error: 'You must accept the Privacy Policy' });
            return;
        }
        openLoaderModal();
        isSigningUpRef.current = true;
        core.transport.dispatch({
            action: 'Ctx',
            args: {
                action: 'Authenticate',
                args: {
                    type: 'Register',
                    email: state.email,
                    password: state.password,
                    gdpr_consent: {
                        tos: state.termsAccepted,
                        privacy: state.privacyPolicyAccepted,
                        marketing: state.marketingAccepted,
                        from: 'web'
                    }
                }
            }
        });
    }, [state.email, state.password, state.confirmPassword, state.termsAccepted, state.privacyPolicyAccepted, state.marketingAccepted]);
    const emailOnChange = React.useCallback((event) => {
        dispatch({
            type: 'change-credentials',
            name: 'email',
            value: event.currentTarget.value
        });
    }, []);
    const emailOnSubmit = React.useCallback(() => {
        passwordRef.current.focus();
    }, []);
    const passwordOnChange = React.useCallback((event) => {
        dispatch({
            type: 'change-credentials',
            name: 'password',
            value: event.currentTarget.value
        });
    }, []);
    const passwordOnSubmit = React.useCallback(() => {
        if (state.form === SIGNUP_FORM) {
            confirmPasswordRef.current.focus();
        } else {
            loginWithEmail();
        }
    }, [state.form, loginWithEmail]);
    const confirmPasswordOnChange = React.useCallback((event) => {
        dispatch({
            type: 'change-credentials',
            name: 'confirmPassword',
            value: event.currentTarget.value
        });
    }, []);
    const confirmPasswordOnSubmit = React.useCallback(() => {
        termsRef.current.focus();
    }, []);
    const toggleTermsAccepted = React.useCallback(() => {
        dispatch({ type: 'toggle-checkbox', name: 'termsAccepted' });
    }, []);
    const togglePrivacyPolicyAccepted = React.useCallback(() => {
        dispatch({ type: 'toggle-checkbox', name: 'privacyPolicyAccepted' });
    }, []);
    const toggleMarketingAccepted = React.useCallback(() => {
        dispatch({ type: 'toggle-checkbox', name: 'marketingAccepted' });
    }, []);
    const switchFormOnClick = React.useCallback(() => {
        const queryParams = new URLSearchParams([['form', state.form === SIGNUP_FORM ? LOGIN_FORM : SIGNUP_FORM]]);
        window.location = `#/intro?${queryParams.toString()}`;
    }, [state.form]);
    React.useEffect(() => {
        if ([LOGIN_FORM, SIGNUP_FORM].includes(queryParams.get('form'))) {
            dispatch({ type: 'set-form', form: queryParams.get('form') });
        }
    }, [queryParams]);
    React.useEffect(() => {
        if (routeFocused && typeof state.error === 'string' && state.error.length > 0) {
            errorRef.current.scrollIntoView();
        }
    }, [state.error]);
    React.useEffect(() => {
        if (routeFocused) {
            emailRef.current.focus();
        }
    }, [state.form, routeFocused]);
    React.useEffect(() => {
        const onCoreEvent = async ({ event, args }) => {
            switch (event) {
                case 'UserAuthenticated': {
                    closeLoaderModal();
                    // Remove official addons and install custom addons if this was a signup
                    if (isSigningUpRef.current) {
                        isSigningUpRef.current = false;
                        await removeOfficialAddons(core);
                        await installDefaultAddons(core);
                    }
                    if (routeFocused) {
                        window.location = '#/';
                    }
                    break;
                }
                case 'Error': {
                    if (args.source.event === 'UserAuthenticated') {
                        closeLoaderModal();
                        isSigningUpRef.current = false;
                    }

                    break;
                }
            }
        };
        core.transport.on('CoreEvent', onCoreEvent);
        return () => {
            core.transport.off('CoreEvent', onCoreEvent);
        };
    }, [routeFocused]);
    return (
        <div className={styles['intro-container']}>
            <div className={styles['background-container']} />
            <div className={styles['heading-container']}>
                <div className={styles['logo-container']}>
                    <Image className={styles['logo']} src={require('/images/logo.png')} alt={' '} />
                </div>
                <div className={styles['title-container']}>
                    {t('WEBSITE_SLOGAN_NEW_NEW')}
                </div>
                <div className={styles['slogan-container']}>
                    {t('WEBSITE_SLOGAN_ALL')}
                </div>
            </div>
            <div className={styles['content-container']}>
                <div className={styles['form-container']}>
                    <CredentialsTextInput
                        ref={emailRef}
                        className={styles['credentials-text-input']}
                        type={'email'}
                        placeholder={t('EMAIL')}
                        value={state.email}
                        onChange={emailOnChange}
                        onSubmit={emailOnSubmit}
                    />
                    <CredentialsTextInput
                        ref={passwordRef}
                        className={styles['credentials-text-input']}
                        type={'password'}
                        placeholder={t('PASSWORD')}
                        value={state.password}
                        onChange={passwordOnChange}
                        onSubmit={passwordOnSubmit}
                    />
                    {
                        state.form === SIGNUP_FORM ?
                            <React.Fragment>
                                <CredentialsTextInput
                                    ref={confirmPasswordRef}
                                    className={styles['credentials-text-input']}
                                    type={'password'}
                                    placeholder={t('PASSWORD_CONFIRM')}
                                    value={state.confirmPassword}
                                    onChange={confirmPasswordOnChange}
                                    onSubmit={confirmPasswordOnSubmit}
                                />
                                <Checkbox
                                    ref={termsRef}
                                    label={t('READ_AND_AGREE')}
                                    link={t('TOS')}
                                    href={'https://www.stremio.com/tos'}
                                    checked={state.termsAccepted}
                                    onChange={toggleTermsAccepted}
                                />
                                <Checkbox
                                    ref={privacyPolicyRef}
                                    label={t('READ_AND_AGREE')}
                                    link={t('PRIVACY_POLICY')}
                                    href={'https://www.stremio.com/privacy'}
                                    checked={state.privacyPolicyAccepted}
                                    onChange={togglePrivacyPolicyAccepted}
                                />
                                <Checkbox
                                    ref={marketingRef}
                                    label={t('MARKETING_AGREE')}
                                    checked={state.marketingAccepted}
                                    onChange={toggleMarketingAccepted}
                                />
                            </React.Fragment>
                            :
                            <div className={styles['forgot-password-link-container']}>
                                <Button className={styles['forgot-password-link']} onClick={openPasswordRestModal}>{t('FORGOT_PASSWORD')}</Button>
                            </div>
                    }
                    {
                        state.error && state.error.length > 0 ?
                            <div ref={errorRef} className={styles['error-message']}>{state.error}</div>
                            :
                            null
                    }
                    <Button className={classnames(styles['form-button'], styles['submit-button'])} onClick={state.form === SIGNUP_FORM ? signup : loginWithEmail}>
                        <div className={styles['label']}>{state.form === SIGNUP_FORM ? t('SIGN_UP') : t('LOG_IN')}</div>
                    </Button>
                </div>
                <div className={styles['options-container']}>
                    <Button className={classnames(styles['form-button'], styles['facebook-button'])} onClick={loginWithFacebook}>
                        <Icon className={styles['icon']} name={'facebook'} />
                        <div className={styles['label']}>{t('FB_LOGIN')}</div>
                    </Button>
                    <Button className={classnames(styles['form-button'], styles['apple-button'])} onClick={loginWithApple}>
                        <Icon className={styles['icon']} name={'macos'} />
                        <div className={styles['label']}>{t('APPLE_LOGIN')}</div>
                    </Button>
                    {
                        state.form === SIGNUP_FORM ?
                            <Button className={classnames(styles['form-button'], styles['login-form-button'])} onClick={switchFormOnClick}>
                                <div className={styles['label']}>{t('LOG_IN')}</div>
                            </Button>
                            :
                            null
                    }
                    {
                        state.form === LOGIN_FORM ?
                            <Button className={classnames(styles['form-button'], styles['signup-form-button'])} onClick={switchFormOnClick}>
                                <div className={styles['label']}>{t('SIGN_UP_EMAIL')}</div>
                            </Button>
                            :
                            null
                    }
                    {
                        state.form === SIGNUP_FORM ?
                            <Button className={classnames(styles['form-button'], styles['guest-login-button'])} onClick={loginAsGuest}>
                                <div className={styles['label']}>{t('GUEST_LOGIN')}</div>
                            </Button>
                            :
                            null
                    }
                </div>
            </div>
            {
                passwordRestModalOpen ?
                    <PasswordResetModal email={state.email} onCloseRequest={closePasswordResetModal} />
                    :
                    null
            }
            {
                loaderModalOpen ?
                    <Modal className={styles['loading-modal-container']}>
                        <div className={styles['loader-container']}>
                            <Icon className={styles['icon']} name={'person'} />
                            <div className={styles['label']}>{t('AUTHENTICATING')}</div>
                            <Button className={styles['button']} onClick={cancelLoginWithFacebook && cancelLoginWithApple}>
                                {t('BUTTON_CANCEL')}
                            </Button>
                        </div>
                    </Modal>
                    :
                    null
            }
        </div>
    );
};

Intro.propTypes = {
    queryParams: PropTypes.instanceOf(URLSearchParams)
};

module.exports = Intro;
