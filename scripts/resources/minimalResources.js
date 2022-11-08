/**
 * This script updates the resources in a given directory for the given languages
 * Syntax: node scripts/resources/minimalResources.js <path to resources> <language> [language...]
 *
 * to debug: node --inspect-brk scripts/resources/minimalResources.js  tcResources en el-x-koine hbo
 */
require('babel-polyfill'); // required for async/await
const path = require('path-extra');
const fs = require('fs-extra');

/**
 * do update of resources
 * @param {String} languages - languages to keep
 * @param {String} resourcesPath
 */
const executeResourcesTrim = (languages, resourcesPath) => {
  let errors = '';
  const backupPath = path.join(resourcesPath + '.orig');

  try {
    if (fs.existsSync(backupPath)) {
      console.log(`backup folder ${backupPath} already exists, not backing up`);
    } else {
      console.log(`backing up folder ${resourcesPath} to  ${backupPath}`);
      fs.copySync(resourcesPath, backupPath);
      console.log(`backup complete`);
    }

    const languagesIds = getFilesInResourcePath(resourcesPath, null, true);
    console.log(`Started with ${languagesIds && languagesIds.length} languages`);
    const removeLanguages = languagesIds.filter(languagesId => !languages.includes(languagesId));
    console.log(`removing ${removeLanguages && removeLanguages.length} languages`);

    for (const languageId of removeLanguages) {
      console.log(`removing ${languageId} language`);
      const removeLangPath = path.join(resourcesPath, languageId);
      fs.removeSync(removeLangPath);
    }

    const languagesIds_ = getFilesInResourcePath(resourcesPath, null, true);
    console.log(`Finished with ${languagesIds_ && languagesIds_.length} languages`);

    if (languages.length !== languagesIds_.length) {
      const error = `Expected ${languages.length} languages at end, but have ${languagesIds_.length}`;
      console.error(error);
      errors += error + '\n';
    }
  } catch (e) {
    console.error('executeResourcesTrim() - Error on trimming resources:\n', e);
    errors += `error trimming resources\n`;
  }

  if (errors) {
    console.error('executeResourcesTrim() - Errors on trimming resources:\n' + errors);
    return 1; // error
  }
  console.log('executeResourcesTrim() - Updating Succeeded!!!');
  return 0; // no error
};

/**
 * get list of files in resource path
 * @param {String} resourcePath - path
 * @param {String|null} [ext=null] - optional extension to match
 * @param {boolean} foldersOnly - if true then only return folders
 * @param {boolean} filesOnly - if true then only return files that are not folders
 * @return {Array}
 */
function getFilesInResourcePath(resourcePath, ext=null, foldersOnly = false, filesOnly = false) {
  if (fs.lstatSync(resourcePath).isDirectory()) {
    let files = fs.readdirSync(resourcePath).filter(file => {
      if (ext) {
        return path.extname(file) === ext;
      }
      return file !== '.DS_Store';
    }); // filter out .DS_Store

    if (foldersOnly) {
      files = files.filter(file => {
        let valid = (fs.lstatSync(path.join(resourcePath, file)).isDirectory());
        return valid;
      });
    } else if (filesOnly) {
      files = files.filter(file => {
        let valid = (!fs.lstatSync(path.join(resourcePath, file)).isDirectory());
        return valid;
      });
    }

    return files;
  }
  return [];
}

/**
 * iterate through process arguments and separate out flags and other parameters
 * @return {{flags: [], otherParameters: []}}
 */
function separateParams() {
  const flags = [];
  const otherParameters = [];

  for (let i = 2, l = process.argv.length; i < l; i++) {
    const param = process.argv[i];

    if (param.substr(0, 1) === '-') { // see if flag
      flags.push(param);
    } else {
      otherParameters.push(param);
    }
  }
  return { flags, otherParameters };
}

/**
 * see if flag is in flags
 * @param {Array} flags
 * @param {String} flag - flag to match
 * @return {Boolean}
 */
function findFlag(flags, flag) {
  const found = flags.find((item) => (item === flag));
  return !!found;
}

// run as main
if (require.main === module) {
  const { flags, otherParameters } = separateParams();

  if (otherParameters.length < 2) {
    console.error('Syntax: node scripts/resources/minimalResources.js [flags] <path to resources> <language> [language...]');
    return 1;
  }

  const resourcesPath = otherParameters[0];
  const languages = otherParameters.slice(1);

  if (! fs.existsSync(resourcesPath)) {
    console.error('Directory does not exist: ' + resourcesPath);
    process.exitCode = 1; // set exit error code
    return;
  }

  const code = executeResourcesTrim(languages, resourcesPath);
  console.log(`Returning code ${code}`);
  process.exitCode = code; // set exit code, 0 = no error
}
