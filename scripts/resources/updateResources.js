/**
 * This script updates the resources in a given directory for the given languages
 * Syntax: node scripts/resources/updateResources.js <path to resources> <language> [language...]
 *
 * to debug: node --inspect-brk scripts/resources/updateResources.js  tcResources en hi el-x-koine hbo --allAlignedBibles --uWoriginalLanguage
 */
require('babel-polyfill'); // required for async/await
const path = require('path-extra');
const fs = require('fs-extra');
const {
  default: SourceContentUpdater,
  apiHelpers,
  resourcesHelpers,
} = require('tc-source-content-updater');
const packagefile = require('../../package.json');
const UpdateResourcesHelpers = require('./updateResourcesHelpers');
const zipResourcesContent = require('./zipHelpers').zipResourcesContent;

// TRICKY: with multi owner support of resources for now we want to restrict the bundled resources to these owners
// set to null to remove restriction, or you can add other permitted owners to list
const filterByOwner = ['Door43-Catalog'];
const USFMJS_VERSION = packagefile?.dependencies?.['usfm-js'];

let prevalidationCompleted = false;

/**
 * find resources to update
 * @param {String} languages - languages to update resources
 * @param {String} resourcesPath
 * @param {Boolean} allAlignedBibles - if true then all aligned bibles from all languages are updated also
 * @param {Boolean} uWoriginalLanguage - if true then we also want uW original languages updated
 * @return {Promise<String>}
 */
const updateResources = async (languages, resourcesPath, allAlignedBibles, uWoriginalLanguage) => {
  const UNFOLDING_WORD = 'unfoldingWord';
  const sourceContentUpdater = new SourceContentUpdater();

  try {
    let lexiconValid = validateLexicons(resourcesPath);

    if (!lexiconValid) {
      // eslint-disable-next-line no-throw-literal
      throw `English Lexicons are not valid`;
    }

    const localResourceList = apiHelpers.getLocalResourceList(resourcesPath);
    checkForBrokenResources(localResourceList, resourcesPath);
    const filterByOwner_ = [...filterByOwner];

    if (uWoriginalLanguage) {
      filterByOwner_.push(UNFOLDING_WORD);
    }

    const latestManifestKey = { Bible: { 'usfm-js': USFMJS_VERSION } };
    const config = {
      filterByOwner: filterByOwner_,
      latestManifestKey,
    };

    prevalidationCompleted = true;

    await sourceContentUpdater.getLatestResources(localResourceList, config)
      .then(async () => {
        let updateList = [];

        if (uWoriginalLanguage) {
          for (const item of sourceContentUpdater.updatedCatalogResources) {
            if (item.owner === UNFOLDING_WORD) {
              const isOriginal = (item.languageId === 'el-x-koine' && item.resourceId === 'ugnt') ||
                (item.languageId === 'hbo' && item.resourceId === 'uhb');

              if (!isOriginal) { // skip over any uw repos that are not original langs
                continue;
              }
            }

            updateList.push(item);
          }
        } else {
          updateList = sourceContentUpdater.updatedCatalogResources;
        }

        await sourceContentUpdater.downloadResources(languages, resourcesPath,
          updateList, // list of static resources that are newer in catalog
          allAlignedBibles)
          .then(resources => {
            resources.forEach(resource => {
              console.log('Updated resource \'' + resource.resourceId + '\' for language \'' + resource.languageId + '\' to v' + resource.version);
              const found = languages.find((language) => (language === resource.languageId));

              if (!found) { // if language for resource was not in original list, then add it for language list to zip up
                languages.push(resource.languageId);
              }
            });
          })
          .catch(err => {
            console.error(err);
          });
      });
    return sourceContentUpdater.getLatestDownloadErrorsStr();
  } catch (e) {
    const message = `Error getting latest resources: `;
    console.error(message, e);
    return `${message}: ${e.toString()}`;
  }
};

/**
 * check local resource list to find broken resources, and flag for replacement
 * @param resourceList
 * @param resourcesPath
 */
function checkForBrokenResources(resourceList, resourcesPath) {
  const BIBLES_PATH = 'bibles';
  const TW_PATH = 'translationHelps/translationWords';
  const TA_PATH = 'translationHelps/translationAcademy';
  const TN_PATH = 'translationHelps/translationNotes';

  for (const resource of resourceList) {
    // const manifest = resource.manifest || {};
    let typePath = null;
    let validResource = true;
    let expectedFiles = ['manifest.json', 'contents.zip'];

    switch (resource.resourceId) {
    case 'ta':
      typePath = TA_PATH;
      break;
    case 'tn':
      typePath = TN_PATH;
      break;
    case 'tw':
      typePath = TW_PATH;
      break;
    default:
      // default to bible
      typePath = path.join(BIBLES_PATH, resource.resourceId);
      expectedFiles = ['index.json', 'manifest.json', 'books.zip'];
      break;
    }

    if (typePath) {
      validResource = false;
      const resourceBasePath = path.join(resourcesPath, resource.languageId, typePath);

      if (fs.existsSync(resourceBasePath)) {
        validResource = true;
        const latest = getLatestVersionsAndOwners(resourceBasePath);
        const orgPath = latest && latest[resource.owner];

        if (!orgPath) {
          console.warn(`No current versions for ${resource.owner} in: ${resourceBasePath}`);
          validResource = false;
        } else {
          const latestPath = orgPath;

          for (const fileName of expectedFiles) {
            const filePath = path.join(latestPath, fileName);

            if (!fs.existsSync(filePath)) {
              console.warn(`Resource is missing file: ${filePath}`);
              validResource = false;
            }
          }
        }
      } else {
        validResource = false;
        console.warn(`Resource is not valid at: ${resourceBasePath}`);
      }
    } else {
      console.warn(`Resource could not be identified: ${JSON.stringify(resource)}`);
    }

    if (!validResource) {
      // break resource item in list, so resource will be replaced
      console.warn(`invalidating resource: ${JSON.stringify(resource)}`);
      resource.version = 'v0';
      resource.languageId = 'zzzz';
    }
  }
}

/**
 * make sure lexicons are present
 * @param resourcesPath
 * @returns {boolean}
 */
function validateLexicons(resourcesPath) {
  let lexiconValid = false;
  const lexiconPath = path.join(resourcesPath, 'en/lexicons');

  if (fs.existsSync(lexiconPath)) {
    const langs = ['ugl', 'uhl'];
    lexiconValid = true;

    for (const lang of langs) {
      const lexiconLangPath = path.join(lexiconPath, lang);

      if (fs.existsSync(lexiconLangPath)) {
        const latest = getLatestVersionsAndOwners(lexiconLangPath);

        if (latest && Object.keys(latest).length) {
          const latestD43 = latest['Door43-Catalog'];

          if (latestD43) {
            const latestVersionContentPath = path.join(latestD43, 'contents.zip');

            if (fs.existsSync(latestD43)) {
              if (fs.existsSync(latestVersionContentPath)) {
                continue;
              } else {
                console.warn(`Lexicon content missing at: ${latestVersionContentPath}`);
              }
            } else {
              console.warn(`Lexicon version folder missing at: ${latestD43}`);
            }
          }
        } else {
          console.warn(`No Lexicon versions found in: ${lexiconLangPath}`);
        }
      } else {
        console.warn(`Lexicon folder missing: ${lexiconLangPath}`);
      }

      console.warn(`Lexicon invalid: ${lexiconLangPath}`);
      lexiconValid = false;
    }
  }
  return lexiconValid;
}

/**
 * Returns the versioned folder within the directory with the highest value.
 * e.g. `v10` is greater than `v9`
 * @param {string} dir - the directory to read
 * @return {string} the full path to the latest version directory.
 */
function getLatestVersionsAndOwners(dir) {
  const versionAndOwners = resourcesHelpers.listVersions(dir, true);
  const orgs = {};

  for (const versionAndOwner of versionAndOwners) {
    const { owner } = resourcesHelpers.splitVersionAndOwner(versionAndOwner);

    if (!orgs[owner]) {
      orgs[owner] = [];
    }
    orgs[owner].push(versionAndOwner);
  }

  const orgsKeys = Object.keys(orgs);

  for (const org of orgsKeys) {
    const versions = orgs[org];
    const latest = path.join(dir, versions[0]);
    orgs[org] = latest;
  }

  if (orgsKeys.length > 0) {
    return orgs;
  } else {
    return null;
  }
}

/**
 * get last update resources time
 * @param {String} resourcesPath
 * @return {null|Date}
 */
const getResourceUpdateTime = (resourcesPath) => {
  const sourceContentManifestPath = path.join(resourcesPath, 'source-content-updater-manifest.json');
  let manifest = {};

  if (fs.existsSync(sourceContentManifestPath)) {
    manifest = fs.readJSONSync(sourceContentManifestPath);
  }

  if (manifest && manifest.modified) {
    return new Date(manifest.modified);
  }
  return null;
};

/**
 * returns true if resources were recently updated
 * @param {String} resourcesPath
 * @return {Boolean}
 */
const areResourcesRecent = (resourcesPath) => {
  const threshold = 60 * 60; // threshold is 1 hour
  const updateTime = getResourceUpdateTime(resourcesPath);

  if (updateTime) {
    const currentTime = new Date();
    let secondsDif = (currentTime.getTime() - updateTime.getTime()) / 1000;

    if (secondsDif < 0) {
      secondsDif = 0;
    }

    if (secondsDif < 60) {
      console.log(`areResourcesRecent() - ${secondsDif} seconds elapsed since last update`);
    } else {
      const minutesDif = secondsDif / 60;

      if (minutesDif < 60) {
        console.log(`areResourcesRecent() - ${minutesDif} minutes elapsed since last update`);
      } else {
        const hoursDif = minutesDif / 60;

        if (hoursDif < 60) {
          console.log(`areResourcesRecent() - ${hoursDif} hours elapsed since last update`);
        } else {
          const daysDif = hoursDif / 24;
          console.log(`areResourcesRecent() - ${daysDif} days elapsed since last update`);
        }
      }
    }
    return secondsDif < threshold;
  }

  return false;
};

/**
 * do update of resources
 * @param {String} languages - languages to update resources
 * @param {String} resourcesPath
 * @param {Boolean} allAlignedBibles - if true then all aligned bibles from all languages are updated also
 * @param {Boolean} uWoriginalLanguage - if true then we also want uW original languages updated
 * @return {Promise<number>} return 0 if no error
 */
const executeResourcesUpdate = async (languages, resourcesPath, allAlignedBibles, uWoriginalLanguage) => {
  let errors = false;

  if (!USFMJS_VERSION) {
    console.error(`executeResourcesUpdate() - could not read usfm-js version`);
    return 1;
  }

  if (areResourcesRecent(resourcesPath)) {
    console.log('executeResourcesUpdate() - Resources recently updated, so nothing to do');
  } else {
    const importsPath = path.join(resourcesPath, 'imports');// Remove old imports folder

    if (fs.existsSync(importsPath)) { // do safe folder delete of imports
      const tempPath = importsPath + '.temp';
      fs.moveSync(importsPath, tempPath);
      fs.removeSync(tempPath);
    }

    errors = await updateResources(languages, resourcesPath, allAlignedBibles, uWoriginalLanguage);

    if (errors) {
      console.log('executeResourcesUpdate() - Errors on downloading updated resources!!', errors);
    }

    if (prevalidationCompleted) {
      console.log('executeResourcesUpdate() - Zipping up updated resources');

      languages.forEach(async (languageId) => {
        try {
          await zipResourcesContent(resourcesPath, languageId);
        } catch (e) {
          errors += e.toString() + '\n';
        }
      });
    }

    if (!errors) {
      // update source content updater manifest, but don't clobber tCore version
      UpdateResourcesHelpers.updateSourceContentUpdaterManifest(resourcesPath);
    }
  }

  if (errors) {
    console.error('executeResourcesUpdate() - Errors on downloading updated resources:\n' + errors);
    return 1; // error
  }
  console.log('executeResourcesUpdate() - Updating Succeeded!!!');
  return 0; // no error
};

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
    console.error('Syntax: node scripts/resources/updateResources.js [flags] <path to resources> <language> [language...]');
    return 1;
  }

  const resourcesPath = otherParameters[0];
  const languages = otherParameters.slice(1);
  const allAlignedBibles = findFlag(flags, '--allAlignedBibles');
  const uWoriginalLanguage = findFlag(flags, '--uWoriginalLanguage');

  if (! fs.existsSync(resourcesPath)) {
    console.error('Directory does not exist: ' + resourcesPath);
    process.exitCode = 1; // set exit error code
    return;
  }

  executeResourcesUpdate(languages, resourcesPath, allAlignedBibles, uWoriginalLanguage).then(code => {
    process.exitCode = code; // set exit code, 0 = no error
  });
}
