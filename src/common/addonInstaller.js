// Copyright (C) 2017-2023 Smart code 203358507

const { DEFAULT_ADDONS, ADDONS_TO_REMOVE } = require('./addonsConfig');

// Function to remove specific addons (only non-protected)
const removeAddons = async (core) => {
    const removePromises = ADDONS_TO_REMOVE.map(async (addonUrl) => {
        try {
            const response = await fetch(addonUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                },
                signal: AbortSignal.timeout(5000) // 5 second timeout
            });

            if (!response.ok) {
                console.log('Failed to fetch addon manifest:', addonUrl, response.status);
                return;
            }

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
            console.log('Removed addon:', addonUrl);
        } catch (error) {
            console.log('Skipping addon (may be protected or not installed):', addonUrl, error.message);
        }
    });

    // Wait for all removals to complete (or fail)
    await Promise.allSettled(removePromises);
};

// Function to install custom addons
const installDefaultAddons = async (core) => {
    let successCount = 0;
    let failCount = 0;

    console.log('[AddonInstaller] Starting installation of', DEFAULT_ADDONS.length, 'addons');

    // Process addons sequentially to avoid overwhelming the system
    for (const addonUrl of DEFAULT_ADDONS) {
        try {
            console.log('[AddonInstaller] Fetching:', addonUrl);

            const response = await fetch(addonUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                },
                signal: AbortSignal.timeout(10000) // 10 second timeout per addon
            });

            if (!response.ok) {
                console.log('[AddonInstaller] Failed to fetch:', addonUrl, response.status);
                failCount++;
                continue;
            }

            const manifest = await response.json();

            if (!manifest || !manifest.id || !manifest.name) {
                console.log('[AddonInstaller] Invalid manifest:', addonUrl);
                failCount++;
                continue;
            }

            console.log('[AddonInstaller] Installing:', manifest.name);

            // Use a Promise to handle the installation
            await new Promise((resolve) => {
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

                // Give it a moment to process
                setTimeout(resolve, 500);
            });

            console.log('[AddonInstaller] Successfully installed:', manifest.name);
            successCount++;
        } catch (error) {
            console.log('[AddonInstaller] Error installing:', addonUrl, error.message);
            failCount++;
        }
    }

    console.log(`[AddonInstaller] Complete: ${successCount} installed, ${failCount} failed`);
    return { successCount, failCount };
};

module.exports = {
    removeAddons,
    installDefaultAddons
};
