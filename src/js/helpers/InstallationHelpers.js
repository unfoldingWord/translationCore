const {
  exec,
  execSync,
  spawnSync,
} = require('child_process');
const os = require('os');
const env = require('tc-electron-env');
const fs = require('fs-extra');
const mkdirp = require('mkdirp');
const path = require('path-extra');
const open = require('opn');
const rimraf = require('rimraf');
const download = require('./DownloadHelpers').download;

const GIT_VERSION = '2.35.1';
const GIT_PATCH = '.2';
module.exports.GIT_VERSION = GIT_VERSION;
module.exports.GIT_PATCH = GIT_PATCH;

/***
 * Downloads a git installer for windows
 * @param version the desired version of git
 * @param arch the windows architecture e.g. 64 or 32
 * @param patch - optional patch level such as `.2`
 * @return {Promise.<string>} the path to the downloaded file
 */
const downloadWinGit = (version, arch, patch = '') => {
  let url = `https://github.com/git-for-windows/git/releases/download/v${version}.windows${patch}/Git-${version}${patch}-${arch}-bit.exe`;
  let dir = path.join(env.home(), 'translationCore', '.temp');
  let dest = dir + `/Git-${version}${patch}-${arch}-bit.exe`;
  console.log('Downloading Git to ' + dest);
  mkdirp.sync(dir);

  if (!fs.existsSync(dest)) {
    console.log(`Downloading git ${version}${patch} for ${arch} bit from ${url}`);
    return download(url, dest).then(() => Promise.resolve(dest)).catch((e) => {
      // clean files
      rimraf.sync(dest);
      return Promise.reject(e);
    });
  } else {
    console.log(`Cache hit at ${dest}`);
    return Promise.resolve(dest);
  }
};
module.exports.downloadWinGit = downloadWinGit;

/**
 * Checks if git is installed
 * @return {Promise.<bool>} returns true if git is available
 */
const isGitInstalled = () => new Promise((resolve) => {
  exec('git', (err, data) => {
    resolve(!!data);
  });
});
module.exports.isGitInstalled = isGitInstalled;

/**
 * Determines if Xcode Command Line Tools (CLT) are installed on the system.
 * This function checks if the system is macOS and verifies the presence of the Xcode Command Line Tools by running `xcode-select -p`.
 *
 * @return {boolean} Returns true if Xcode Command Line Tools are installed. Returns true by default for non-macOS platforms, as the check is not applicable.
 */
function isXcodeCLTInstalled() {
  // Only relevant on macOS
  if (os.platform() !== 'darwin') {
    // Return true for non-macOS
    return true;
  }

  try {
    // `xcode-select -p` returns the path to the active developer directory
    const output = execSync('xcode-select -p', {
      stdio: ['ignore', 'pipe', 'ignore'],
      encoding: 'utf8',
    }).trim();

    // Basic sanity check: path should not be empty and should look like a directory
    let validPath = output &&
      output.length > 0;

    if (validPath) {
      validPath = fs.existsSync(output);

      if (!validPath) {
        console.error('areXcodeCLTInstalled() - command line tools are not present');
      } else {
        console.error('areXcodeCLTInstalled() - xcode-select failed');
      }
    }

    return Boolean(validPath);
  } catch (err) {
    console.error('areXcodeCLTInstalled() - Command failed - CLT very likely not installed', err);
    return false;
  }
}
module.exports = { isXcodeCLTInstalled };

/**
 * Checks if the Xcode license agreement has been accepted on macOS.
 *
 * This method determines whether the user has accepted the Xcode license agreement.
 * If the platform is not macOS, it assumes Xcode is not applicable and returns true.
 * On macOS, it runs the `xcodebuild -license check` command to verify the license status.
 *
 * @return {boolean} - Returns true if the Xcode license agreement has been accepted or if the platform is not macOS.
 *                      Returns false if the license agreement has not been accepted or if the `xcodebuild` command is missing.
 */
function hasAcceptedXcodeLicense() {
  if (os.platform() !== 'darwin') {
    // Not macOS â€“ Xcode not applicable
    return true;
  }

  // `xcodebuild -license check` returns:
  //   exitCode 0 -> license accepted
  //   non-zero   -> license not accepted or xcodebuild missing
  const result = spawnSync('xcodebuild', ['-license', 'check'], { stdio: 'ignore' });

  // If xcodebuild is missing or the command fails, status will be non-zero.
  return result.status === 0;
}
module.exports = { hasAcceptedXcodeLicense };

/**
 * Returns the bits supported by the processor. e.g. 32/64
 * @return {string}
 */
const getArchBits = () => {
  if (process.env.PROCESSOR_ARCHITECTURE === 'AMD64') {
    return '64';
  } else {
    return '32';
  }
};

/**
 * Installs git for windows
 * @param filepath path to the executable
 * @return {Promise} resolves if successful otherwise rejects
 */
// const installWinGit = (filepath) => {
//   console.log('Installing Git');
//   return open(filepath);
// };

// const downloadAndInstallWinGit = () => {
//   return downloadWinGit(GIT_VERSION, getArchBits()).then(filepath => {
//     return installWinGit(filepath).catch((e) => {
//       // clean cache if install fails
//       rimraf.sync(filepath);
//       return Promise.reject(e);
//     });
//   });
// };

/**
 * Displays a dialog prompting users to download git.
 * @param dialog the electron dialog object
 * @return {Promise} resolves with affirmative, rejects with cancel
 */
const showElectronGitDialog = (dialog) => new Promise((resolve, reject) => {
  dialog.showMessageBox({
    'title': 'Install Git',
    'message': 'You must install Git before using translationCore.\n' +
      'Please install Git and try again.',
    'buttons': [
      'Download Git',
      'Close translationCore',
    ],
    'defaultId': 0, // select download button
    'cancelId': 1,
  }, response => {
    if (response === 0) {
      resolve();
    } else {
      reject();
    }
  });
});

/**
 * Displays a dialog prompting users to download git.
 * @param dialog the electron dialog object
 * @return {Promise} resolves with affirmative, rejects with cancel
 */
const showElectronGitDialogMacOS = (dialog) => new Promise((resolve, reject) => {
  dialog.showMessageBox({
    'title': 'Install XCode Command-Line Tools',
    'message': 'You must install XCode Command-Line Tools before using translationCore.\n\n' +
      'You can install them by running `xcode-select --install` in Terminal.',
    'buttons': [
      'Close translationCore',
    ],
    'defaultId': 0, // select Close button
  }, response => {
    if (response === 0) {
      reject();
    }
  });
});

/**
 * Displays a dialog informing the user that the Xcode license agreement has not been accepted
 * and provides guidance on how to accept it. This is specifically for macOS users where
 * the use of certain features requires the acceptance of the Xcode license agreement.
 *
 * @param {Object} dialog - The dialog instance used to render the message box.
 * @returns {Promise} A promise that resolves or rejects based on user interaction with the dialog.
 *                     The promise rejects if the user closes the dialog.
 */
const showAcceptScodeLicenseDialogMacOS = (dialog) => new Promise((resolve, reject) => {
  dialog.showMessageBox({
    'title': 'Xcode License Not Accepted',
    'message': 'You must accept the Xcode license agreement before using certain features.\n\n' +
      'Open Terminal and run:\n\n' +
      '  sudo xcodebuild -license\n\n' +
      'Follow the prompts to review and accept the license.',
    'buttons': [
      'Close translationCore',
    ],
    'defaultId': 0, // select Close button
  }, response => {
    if (response === 0) {
      reject();
    }
  });
});
module.exports.showAcceptScodeLicenseDialogMacOS = showAcceptScodeLicenseDialogMacOS;

/**
 * Displays the git setup screens if necessary.
 *
 * @param dialog the electron dialog object
 * @return {Promise}
 */
const showElectronGitSetup = (dialog) => {
  if (process.platform === 'win32') {
    // install windows git
    return showElectronGitDialog(dialog).then(() => {
      console.log('Redirecting to Git download page');
      let url = `https://github.com/git-for-windows/git/releases/download/v${GIT_VERSION}.windows.1/Git-${GIT_VERSION}-${getArchBits()}-bit.exe`;
      return open(url);

      // NOTE: this automatic installation bit isn't working
      // return downloadAndInstallWinGit().catch(err => {
      //   console.log(err);
      //   dialog.showErrorBox('Installation Failed', 'Git could not be automatically installed. Please install Git manually and try again.');
      //   return open('https://git-for-windows.github.io/');
      // });
    });
  } else if (process.platform === 'darwin') {
    console.log('MacOS needs command-line tools');
    return showElectronGitDialogMacOS(dialog).then(() => {
      console.log('Mac OS Quit');
      return false;
    });
  } else {
    // make linux users install git manually
    return showElectronGitDialog(dialog).then(() => {
      console.log('Redirecting to Git download page');
      return open('https://git-scm.com/downloads');
    });
  }
};
module.exports.showElectronGitSetup = showElectronGitSetup;
