const exec = require('child_process').exec;
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
  let url = `https://github.com/git-for-windows/git/releases/download/v${version}.windows${patch}/Git-${version}-${arch}-bit.exe`;
  let dir = path.join(env.home(), 'translationCore', '.temp');
  let dest = dir + `/Git-${version}-${arch}-bit.exe`;
  console.log('Downloading Git to ' + dest);
  mkdirp.sync(dir);

  if (!fs.existsSync(dest)) {
    console.log(`Downloading git ${version} for ${arch} bit from ${url}`);
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
  } else {
    // make linux and macOS users install git manually
    return showElectronGitDialog(dialog).then(() => {
      console.log('Redirecting to Git download page');
      return open('https://git-scm.com/downloads');
    });
  }
};
module.exports.showElectronGitSetup = showElectronGitSetup;
