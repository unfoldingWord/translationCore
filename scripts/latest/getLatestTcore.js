const semver = require('semver');
const axios = require('axios');

////////////////////////////////////////////////
// taken from SoftwareUpdateDialogContainer.js
//
// to debug: node --inspect-brk scripts/latest/getLatestTcore.js

/**
 * Returns the correct update asset for this operating system.
 * If the update is not newer than the installed version null will be returned.
 *
 * @param {object} response - the network response
 * @param {string} installedVersion - the installed version of the application
 * @param {string} osArch - the operating system architecture
 * @param {string} osPlatform - the operating system.
 * @return {*} the update object
 */
function getUpdateAsset(response, installedVersion, osArch, osPlatform) {
  let fallbackPlatform = null;
  let fallbackUpdate = null;
  const platformNames = {
    'aix': 'linux',
    'darwin': 'macos',
    'macos': 'macos',
    'freebsd': 'linux',
    'linux': 'linux',
    'openbsd': 'linux',
    'sunos': 'linux',
    'win32': 'win',
    'win': 'win',
  };

  // TRICKY: some architectures will return ia32 instead of x32
  if (osArch === 'ia32') {
    osArch = 'x32';
  }

  const platformName = platformNames[osPlatform];

  if (osArch === 'arm64') {
    fallbackPlatform = `${platformName}-universal`;
  }

  const platform = `${platformName}-${osArch}`;
  let update = null;
  const tagName = response.tag_name;
  console.log(`Release tag-name `, tagName);

  for (const asset of response.assets) {
    if (asset.name.includes(platform)) {
      update = {
        ...asset,
        latest_version: tagName,
        installed_version: installedVersion,
      };
      break;
    } else if (fallbackPlatform && asset.name.includes(fallbackPlatform)) {
      fallbackUpdate = {
        ...asset,
        latest_version: tagName,
        installed_version: installedVersion,
      };
    }
  }

  const isLiteRelease = tagName.toUpperCase().includes('-LITE');

  if (!update) { // if we didn't find exact match, use fallback compatible match
    console.log(`using fallback architecture:`, fallbackUpdate);
    update = fallbackUpdate;
  }

  // validate version
  let upToDate = false;

  if (update) {
    const latest = semver.valid(semver.coerce(update.latest_version));
    const installed = semver.valid(semver.coerce(update.installed_version));

    if (!semver.gt(latest, installed)) {
      console.log(`installed version ${update.installed_version} is up to date with release version ${update.latest_version} `);
      upToDate = true;
    } else {
      console.log(`installed version ${update.installed_version} is older than release version ${update.latest_version} `);
    }
  }
  return {
    update,
    upToDate,
    tagName,
    isLiteRelease,
  };
}

/**
 * does fetch
 * @private
 */
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    const request = {
      cancelToken: source.token,
      method: 'GET',
      url,
    };

    axios(request).then(response => {
      resolve(response);
    }).catch(error => {
      reject(error);
    });
  });
}

async function getLatestRelease() {
  const latestReleaseUrl = `https://api.github.com/repos/unfoldingWord-dev/translationCore/releases/latest`;
  const isLiteInstall_ = true;
  const installedVersion = 'v0.0.0';

  const configs = {
    'macos': {
      'x64': null,
      'universal': null,
    },
    'linux': {
      'x64': null,
      'arm64': null,
    },
    'win': {
      'x64': null,
      'x32': null,
    },
  };

  let response = null;

  try {
    response = await fetchUrl(latestReleaseUrl);
  } catch (e) {
    console.error(`Error getting latest tCore from ${latestReleaseUrl}`, e);
  }

  if (response?.data) {
    for (const osPlatform of Object.keys(configs)) {
      const osArchs = configs[osPlatform];

      for (const osArch of Object.keys(osArchs)) {
        let browser_download_url = null;
        const {
          update,
          upToDate,
          tagName,
          isLiteRelease,
        } = getUpdateAsset(response.data, installedVersion, osArch, osPlatform);

        if (update) {
          browser_download_url = update.browser_download_url;

          if (!upToDate && (isLiteInstall_ !== isLiteRelease)) {
            console.log(`found tagName ${tagName} which is a fallback install since isLiteRelease=${isLiteRelease}`, update);
            const baseTagName = tagName.split('-')[0];
            const sizeSuffix = isLiteInstall_ ? '-LITE' : '';
            const rightTagName = baseTagName + sizeSuffix;
            const tagUrl = `https://api.github.com/repos/unfoldingWord-dev/translationCore/releases/tags/${rightTagName}`;
            console.log(`getting release ${rightTagName}`, update);

            try {
              // eslint-disable-next-line no-await-in-loop
              response = await fetchUrl(tagUrl);
              const { update } = getUpdateAsset(response.data, installedVersion, osArch, osPlatform);
              browser_download_url = update.browser_download_url;
            } catch (e) {
              console.error(`Error getting latest tCore from ${tagUrl}`, e);
              return {};
            }
          }
        }
        osArchs[osArch] = browser_download_url;
      }
    }

    return configs;
  }

  return {};
}

getLatestRelease().then(installs => {
  console.log(installs);
});

