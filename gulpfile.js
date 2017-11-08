const gulp = require('gulp');
const mkdirp = require('mkdirp');
const argv = require('yargs').argv;
const fs = require('fs-extra');
const packager = require('electron-packager');

const BUILD_DIR = 'out/';
const RELEASE_DIR = 'release/';

gulp.task('build', done => {
  let platforms = [];

  if (argv.win) platforms.push('win32');
  if (argv.osx) platforms.push('darwin');
  if (argv.linux) platforms.push('linux');
  if (!platforms.length) platforms.push('win32', 'darwin', 'linux');

  let p = require('./package');
  let ignored = Object.keys(p['devDependencies']).concat([
    '.github',
    'coverage',
    '__tests__',
    '__mocks__',
    'vendor',
    BUILD_DIR,
    'scripts',
    '\\.'
  ]).map(name => {
    return new RegExp('(^/' + name + '|' + '^/node_modules/' + name + ')');
  });

  packager({
    'arch': 'all',
    'platform': platforms,
    'dir': '.',
    'ignore': function (name) {
      for (let i = 0, len = ignored.length; i < len; ++i) {
        if (ignored[i].test(name)) {
          console.log('\t(Ignoring)\t', name);
          return true;
        }
      }

      return false;
    },
    'out': BUILD_DIR,
    'app-version': p.version,
    'icon': './src/images/icon'
  }, () => {
    console.log('Done building...');
    done();
  });
});

gulp.task('release', done => {
  const p = require('./package');
  const archiver = require('archiver');
  const exec = require('child_process').exec;

  let promises = [];
  let platforms = [];
  const gitVersion = '2.9.2';

  if (argv.win) platforms.push('win32', 'win64');
  if (argv.win32) platforms.push('win32');
  if (argv.win64) platforms.push('win64');
  if (argv.osx) platforms.push('darwin');
  if (argv.linux) platforms.push('linux');
  if (!platforms.length) platforms.push('win32', 'win64', 'darwin', 'linux');

  /**
   *
   * @param version 2.9.2
   * @param arch 64|32
   * @returns {Promise}
   */
  const downloadGit = function(version, arch) {
    return new Promise(function (resolve, reject) {
      let cmd = `./scripts/git/download_git.sh ./vendor ${version} ${arch}`;
      exec(cmd, function(err, stdout, stderr) {
        if(err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  };

  /**
   *
   * @param arch 64|32
   * @param os
   * @returns {Promise}
   */
  const releaseWin = function(arch, os) {
    // TRICKY: the iss script cannot take the .exe extension on the file name
    let file = `tC_${p.version}-${p.build}_win_x${arch}`;
    let cmd = `./scripts/innosetup/iscc scripts/win_installer.iss /DArch=${arch === '64' ? 'x64' : 'x86'} /DRootPath=../ /DVersion=${p.version} /DBuild=1 /DGitVersion=${gitVersion} /DDestFile=${file} /DDestDir=${RELEASE_DIR} /DBuildDir=${BUILD_DIR}`;
    return new Promise(function(resolve, reject) {
      console.log('Running inno script');
      exec(cmd, function(err, stdout, stderr) {
        if(err) {
          console.error(err);
          resolve({
            os: os,
            status: 'error',
            path: null
          });
        } else {
          resolve({
            os: 'win' + arch,
            status: 'ok',
            path: RELEASE_DIR + file + '.exe'
          });
        }
      });
    });
  };

  mkdirp('release', function() {
    for(let os of platforms) {
      switch (os) {
        case 'win32':
          if (fs.existsSync(BUILD_DIR + p.name + '-win32-ia32/')) {
            promises.push(downloadGit(gitVersion, '32')
              .then(releaseWin.bind(undefined, '32', os)));
          } else {
            promises.push(Promise.resolve({
              os: os,
              status: 'missing',
              path: null
            }));
          }
          break;
        case 'win64':
          if (fs.existsSync(BUILD_DIR + p.name + '-win32-x64/')) {
            promises.push(downloadGit(gitVersion, '64')
              .then(releaseWin.bind(undefined, '64', os)));
          } else {
            promises.push(Promise.resolve({
              os: os,
              status: 'missing',
              path: null
            }));
          }
          break;
        case 'darwin':
          if (fs.existsSync(BUILD_DIR + p.name + '-darwin-x64/')) {
            promises.push(new Promise(function (os, resolve, reject) {
              let dest = `${RELEASE_DIR}tS_${p.version}-${p.build}_osx_x64.zip`;
              try {
                let output = fs.createWriteStream(dest);
                output.on('close', function () {
                  resolve({
                    os: os,
                    status: 'ok',
                    path: dest
                  });
                });
                let archive = archiver.create('zip');
                archive.on('error', reject);
                archive.pipe(output);
                archive.directory(BUILD_DIR + p.name + '-darwin-x64/translationCore.app/', p.name + '.app');
                archive.finalize();
              } catch (e) {
                console.error(e);
                resolve({
                  os: os,
                  status: 'error',
                  path: null
                });
              }
            }.bind(undefined, os)));
          } else {
            promises.push(Promise.resolve({
              os: os,
              status: 'missing',
              path: null
            }));
          }
          break;
        case 'linux':
          if (fs.existsSync(BUILD_DIR + p.name + '-linux-x64/')) {
            promises.push(new Promise(function (os, resolve, reject) {
              let dest = `${RELEASE_DIR}tS_${p.version}-${p.build}_linux_x64.zip`;
              try {
                let output = fs.createWriteStream(dest);
                output.on('close', function () {
                  resolve({
                    os: os,
                    status: 'ok',
                    path: dest
                  });
                });
                let archive = archiver.create('zip');
                archive.on('error', reject);
                archive.pipe(output);
                archive.directory(BUILD_DIR + p.name + '-linux-x64/', p.name);
                archive.finalize();
              } catch (e) {
                console.error(e);
                resolve({
                  os: os,
                  status: 'error',
                  path: null
                });
              }
            }.bind(undefined, os)));
          } else {
            promises.push(Promise.resolve({
              os: os,
              status: 'missing',
              path: null
            }));
          }
          break;
        default:
          console.warn('No release procedure has been defined for ' + os);
      }
    }
    Promise.all(promises).then(function(values) {
      // let releaseNotes = fs.createWriteStream(RELEASE_DIR + 'index.html');
      // releaseNotes.on('error', function(e) {
      //   console.error(e);
      // });
      // releaseNotes.write('<link rel="stylesheet" href="style.css">');
      // releaseNotes.write('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
      // fs.createReadStream('scripts/release/style.css').pipe(fs.createWriteStream('release/style.css'));
      // releaseNotes.write(`<h1>tS Desktop build #<span id="build-num">${p.build}</span></h1><ul>`);
      // if(process.env.TRAVIS_COMMIT) {
      //   let branch = process.env.TRAVIS_BRANCH;
      //   let commit = process.env.TRAVIS_COMMIT;
      //   let buildNumber = process.env.TRAVIS_BUILD_NUMBER;
      //   let buildId = process.env.TRAVIS_BUILD_ID;
      //   let repoSlug = process.env.TRAVIS_REPO_SLUG;
      //   releaseNotes.write(`<h2><a href="https://github.com/${repoSlug}/commit/${commit}" target="_blank">Commit ${commit.substring(0, 7)} on ${branch}</a></h2>`);
      //   releaseNotes.write(`<h2><a href="https://travis-ci.org/${repoSlug}/builds/${buildId}" target="_blank">Travis build #${buildNumber}</a></h2>`);
      // }
      // for(let release of values) {
      //   if(release.status === 'ok') {
      //     release.path = release.path.substring(release.path.indexOf('/') + 1);
      //     releaseNotes.write(`<li class="ok">${release.os} <span class="status">${release.status}</span> <a href="${release.path}" class="build-link" data-os="${release.os}">Download</a></li>`);
      //   } else {
      //     releaseNotes.write(`<li class="${release.status}">${release.os} <span class="status">${release.status}</span>`);
      //   }
      //   console.log(`${release.os}: ${release.status} : ${release.path}`);
      // }
      // releaseNotes.write('</ul>');
      // releaseNotes.end();
      done();
    }).catch(done);
  });
});