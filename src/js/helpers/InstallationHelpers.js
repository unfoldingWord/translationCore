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
  exec('git', (err, stdout, stderr) => {
    if (err || stderr) {
      console.error(`isGitInstalled() - ERROR`, stderr, err);
    } else {
      console.log(`isGitInstalled() - succeeded`, stdout);
    }

    resolve(!!stdout);
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
    const devDir = execSync('xcode-select -p', {
      stdio: ['ignore', 'pipe', 'ignore'],
      encoding: 'utf8',
    }).trim();

    // Basic sanity check: path should not be empty and should look like a directory
    let validPath = devDir &&
      devDir.length > 0;

    if (validPath) {
      validPath = fs.existsSync(devDir);

      if (!validPath) {
        console.error('areXcodeCLTInstalled() - command line tools are not present');
      } else {
        console.log('areXcodeCLTInstalled() - command line tools are at', devDir);
      }
    } else {
      console.error('areXcodeCLTInstalled() - \'xcode-select -p\' failed');
    }

    return Boolean(validPath);
  } catch (err) {
    console.error('areXcodeCLTInstalled() - Command failed - CLT very likely not installed', err);
    return false;
  }
}
module.exports.isXcodeCLTInstalled = isXcodeCLTInstalled;

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
    // Not macOS - Xcode not applicable
    return true;
  }

  // First, determine what the active developer directory is.
  // If it's CommandLineTools, then full Xcode is not selected/installed;
  // in that case, there is no Xcode license to accept, so treat as OK.
  try {
    // run `xcode-select -p`
    const devDir = execSync('xcode-select -p', {
      stdio: ['ignore', 'pipe', 'ignore'],
      encoding: 'utf8',
    }).trim();

    if (devDir && devDir.includes('CommandLineTools')) {
      // Only CLT are installed / active. The `xcodebuild -license` check
      // is not applicable here, so don't block the user.
      console.log('hasAcceptedXcodeLicense() - command line tools are being used');
      return true;
    }
  } catch (e) {
    // If xcode-select itself fails, fall through to the xcodebuild check.
    console.warn('hasAcceptedXcodeLicense() - xcode-select failed, continuing with xcodebuild check', e);
  }

  // At this point, a full Xcode should be active (or we couldn't verify).
  // `xcodebuild -license check` returns:
  //   exitCode 0 -> license accepted
  //   non-zero   -> license not accepted or xcodebuild missing
  const result = spawnSync('xcodebuild', ['-license', 'check'], { stdio: 'ignore' });

  if (result.error && result.error.code === 'ENOENT') {
    // xcodebuild is not found at all; treat as "no Xcode installed" and don't block.
    console.error('hasAcceptedXcodeLicense() - xcodebuild not found; assuming no Xcode installed', result);
    return true;
  }

  // If xcodebuild is present and returns non-zero, the license has not been accepted.
  const accepted = result.status === 0;

  if (!accepted) {
    console.error('hasAcceptedXcodeLicense() - Xcode license has NOT been accepted', result);
  } else {
    console.log('hasAcceptedXcodeLicense() - Xcode license has been accepted', result);
  }
  return accepted;
}
module.exports.hasAcceptedXcodeLicense = hasAcceptedXcodeLicense;

/**
 * Starts the interactive Xcode license acceptance process on macOS.
 *
 * This runs `xcodebuild -license` in a child process, which presents Apple's
 * interactive license text and prompt. The user must review and accept the
 * license manually in the terminal UI; this function cannot auto-accept it.
 *
 * On success (exit code 0), the promise resolves `true`. On failure or
 * non-macOS platforms, it resolves `false`. If `xcodebuild` is missing, it
 * also resolves `false`.
 *
 * NOTE: This should be called from a context where a terminal/TTY is
 * available (e.g., started from your Electron main process on macOS).
 *
 * @return {Promise<boolean>}
 */
function acceptXcodeLicense() {
  return new Promise((resolve) => {
    if (os.platform() !== 'darwin') {
      console.log('acceptXcodeLicense() - non-macOS platform, nothing to do');
      return resolve(true);
    }

    console.log('acceptXcodeLicense() - starting `xcodebuild -license`');

    // TODO - fix this:

    // TRY 1 FAILED
    // const child = spawn('xcodebuild', ['-license'], {
    //   stdio: 'inherit', // let user interact with the license UI
    // });
    //
    // child.on('error', (error) => {
    //   console.error('acceptXcodeLicense() - failed to start xcodebuild', error);
    //   resolve(false);
    // });
    //
    // child.on('exit', (code) => {
    //   if (code === 0) {
    //     console.log('acceptXcodeLicense() - user accepted the Xcode license');
    //     resolve(true);
    //   } else {
    //     console.error(`acceptXcodeLicense() - xcodebuild exited with code ${code}`);
    //     resolve(false);
    //   }
    // });

    // TRY 2 FAILED
    // exec(`osascript -e 'tell application "Terminal"
    //     do script "sudo xcodebuild -license; read -n 1 -s -r -p \\"Press any key to close...\\""
    //     activate
    // end tell'`);
  });
}
module.exports.acceptXcodeLicense = acceptXcodeLicense;

/**
 * Attempts to install Xcode Command Line Tools on macOS.
 *
 * This runs `xcode-select --install`, which will prompt the user with the
 * standard Apple GUI installer. The call is fire-and-forget: it resolves
 * as soon as the command has been successfully spawned, not when the
 * installation is complete.
 *
 * On non-macOS platforms, this is a no-op that resolves immediately.
 *
 * @return {Promise<void>}
 */
function installXcodeCLTmacOS() {
  return new Promise((resolve, reject) => {
    if (os.platform() !== 'darwin') {
      console.log('installXcodeCLTmacOS() - non-macOS platform, skipping');
      return resolve();
    }

    // TODO: this does not work - terminal is not opened
    try {
      // Use exec so macOS can show the GUI installer dialog.
      exec('xcode-select --install', (error, stdout, stderr) => {
        if (error) {
          console.error('installXcodeCLTmacOS() - failed to start installer', error, stderr);
          return reject(error);
        }

        console.log('installXcodeCLTmacOS() - installer command started', stdout);
        // The actual install continues in the background; we just confirm the command started.
        return resolve();
      });
    } catch (e) {
      console.error('installXcodeCLTmacOS() - unexpected error', e);
      reject(e);
    }
  });
}
module.exports.installXcodeCLT = installXcodeCLTmacOS;

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
    'defaultId': 0, // button choice 'Download Git'
    'cancelId': 1, // button choice Close app
  }, response => {
    if (response === 0) {
      resolve(); // return yes to 'Download Git'
    } else {
      reject(); // close app
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
    'defaultId': 0,
  }, response => {
    console.log('response',response);

    reject();
    // if (response === 0) {
    //   resolve(); // return yes to `Accept the Xcode License Agreement'
    // } else {
    //   reject(); // close app
    // }
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
      console.log('MacOS install command-line tools');
      // return installXcodeCLTmacOS();
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
