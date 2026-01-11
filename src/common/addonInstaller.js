// Copyright (C) 2017-2023 Smart code 203358507

const { DEFAULT_ADDONS, ADDONS_TO_REMOVE } = require('./addonsConfig');

function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const finalOptions = Object.assign({}, options || {}, { signal: controller.signal });
  return fetch(url, finalOptions).finally(() => clearTimeout(timer));
}

// Function to remove specific addons (only non-protected)
const removeAddons = async (core) => {
    const removePromises = ADDONS_TO_REMOVE.map(async (addonUrl) => {
        try {
            let response = await fetchWithTimeout(addonUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            }, 5000);

            if (!response.ok && !/manifest\.json$/.test(addonUrl)) {
                const urlWithManifest = addonUrl.replace(/\/+$/, '') + '/manifest.json';
                console.warn('RemoveAddons: retrying manifest fetch with', urlWithManifest);
                try {
                    response = await fetchWithTimeout(urlWithManifest, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json'
                        }
                    }, 5000);
                } catch (err) {
                    console.warn('RemoveAddons: retry fetch error', err.message);
                }
            }

            if (!response || !response.ok) {
                console.warn('Failed to fetch addon manifest:', addonUrl, response && response.status);
                return;
            }

            let manifest;
            try {
                manifest = await response.json();
            } catch (err) {
                console.warn('RemoveAddons: failed to parse manifest JSON', addonUrl, err.message);
                return;
            }

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
            console.warn('Removed addon:', addonUrl);
        } catch (error) {
            console.warn('Skipping addon (may be protected or not installed):', addonUrl, error.message);
        }
    });

    // Wait for all removals to complete (or fail)
    await Promise.allSettled(removePromises);
};

// Function to install custom addons
const installDefaultAddons = async (core) => {
    let successCount = 0;
    let failCount = 0;
    const failedUrls = [];

    console.warn('[AddonInstaller] Starting installation of', DEFAULT_ADDONS.length, 'addons');

    // Process addons sequentially to avoid overwhelming the system
    for (const addonUrl of DEFAULT_ADDONS) {
        try {
            console.warn('[AddonInstaller] Fetching:', addonUrl);

            // Try fetching the URL as provided first
            let response = await fetchWithTimeout(addonUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            }, 10000);

            // If initial fetch failed and addonUrl does not already end with manifest.json,
            // try appending '/manifest.json' as a fallback.
            if (!response.ok) {
                console.warn('[AddonInstaller] Initial fetch failed:', addonUrl, response.status);
                if (!/manifest\.json$/.test(addonUrl)) {
                    const urlWithManifest = addonUrl.replace(/\/+$/, '') + '/manifest.json';
                    console.warn('[AddonInstaller] Retrying with:', urlWithManifest);
                    try {
response = await fetchWithTimeout(urlWithManifest, {
                            method: 'GET',
                            headers: { 'Accept': 'application/json' }
                        }, 10000);
                    } catch (e) {
                        console.warn('[AddonInstaller] Retry fetch error:', urlWithManifest, e.message);
                    }
                }
            }

            if (!response || !response.ok) {
                console.warn('[AddonInstaller] Failed to fetch after retry:', addonUrl, response && response.status);
                failCount++;
                failedUrls.push(addonUrl);
                continue;
            }

            let manifest;
            try {
                manifest = await response.json();
            } catch (err) {
                console.warn('[AddonInstaller] Failed to parse manifest JSON:', addonUrl, err.message);
                failCount++;
                failedUrls.push(addonUrl);
                continue;
            }

            if (!manifest || !manifest.id || !manifest.name) {
                console.warn('[AddonInstaller] Invalid manifest:', addonUrl);
                failCount++;
                failedUrls.push(addonUrl);
                continue;
            }

            console.warn('[AddonInstaller] Installing:', manifest.name);

            // Use a Promise to handle the installation with error handling
            await new Promise((resolve, reject) => {
                const installHandler = ({ event, args }) => {
                    if (event === 'AddonInstalled' && args.transportUrl === addonUrl) {
                        core.transport.off('CoreEvent', installHandler);
                        resolve();
                    } else if (event === 'Error' && args.source.event === 'AddonInstalled' && args.source.args.transportUrl === addonUrl) {
                        core.transport.off('CoreEvent', installHandler);
                        // Don't reject for code 3 errors (non-critical)
                        if (args.error.type === 'Other' && args.error.code === 3) {
                            console.warn('[AddonInstaller] Non-critical error during installation, treating as success:', args.error);
                            resolve();
                        } else {
                            reject(new Error(`Installation failed: ${args.error.message || 'Unknown error'}`));
                        }
                    }
                };

                core.transport.on('CoreEvent', installHandler);

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

                // Give it a moment to process, but don't reject on timeout
                setTimeout(() => {
                    core.transport.off('CoreEvent', installHandler);
                    resolve();
                }, 3000);
            });

            console.warn('[AddonInstaller] Successfully installed:', manifest.name);
            successCount++;
        } catch (error) {
            console.warn('[AddonInstaller] Error installing:', addonUrl, error.message);
            failCount++;
            failedUrls.push(addonUrl);
        }
    }

    console.warn(`[AddonInstaller] Complete: ${successCount} installed, ${failCount} failed`);
    return { successCount, failCount, failedUrls };
};

module.exports = {
    removeAddons,
    installDefaultAddons
};
