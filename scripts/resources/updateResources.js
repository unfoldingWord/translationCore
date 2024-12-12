/**
 * This script updates the resources in a given directory for the given languages
 * Syntax: node scripts/resources/updateResources.js <path to resources> <language> [language...]
 *
 * to debug: node --inspect-brk scripts/resources/updateResources.js tcResources en hi el-x-koine hbo --allAlignedBibles --uWoriginalLanguage --unfoldingWordOrg --preProd
 */
require('babel-polyfill'); // required for async/await
const path = require('path-extra');
const fs = require('fs-extra');
const {
  default: SourceContentUpdater,
  apiHelpers,
  resourcesHelpers,
  STAGE,
} = require('tc-source-content-updater');
const packagefile = require('../../package.json');
const UpdateResourcesHelpers = require('./updateResourcesHelpers');
const { DOOR43_CATALOG, CN_CATALOG, UNFOLDING_WORD } = require("tc-source-content-updater/lib/helpers/apiHelpers");
const zipResourcesContent = require('./zipHelpers').zipResourcesContent;

// TRICKY: with multi owner support of resources for now we want to restrict the bundled resources to these owners
// set to null to remove restriction, or you can add other permitted owners to list
const filterByOwner = ['Door43-Catalog'];
const USFMJS_VERSION = packagefile?.dependencies?.['usfm-js'];
const BIBLES_PATH = 'bibles';
const TW_PATH = 'translationHelps/translationWords';
const TWL_PATH = 'translationHelps/translationWordsLinks';
const TA_PATH = 'translationHelps/translationAcademy';
const TN_PATH = 'translationHelps/translationNotes';

const DOOR43_DEPRECATED = true;

let okToZip = false;
let unfoldingWordOrg = false;
let preProd = false;

/**
 * remove load-after resources from updateList so no duplicate fetches
 * @param {object[]} updateList
 */
function cleanUpLoadAfterResources(updateList) {
  const resourcesWithLoadAfter = updateList.filter(resource => resource?.catalogEntry?.resource?.loadAfter);
  for (const resource of resourcesWithLoadAfter) {
    const loadAfter = resource?.catalogEntry?.resource?.loadAfter;
    if (loadAfter?.length) {
      for (const loadAfterResource of loadAfter) {
        const languageId = loadAfterResource.languageId;
        const owner = loadAfterResource.owner;
        const resourceId = loadAfterResource.resourceId;
        const version = loadAfterResource.version;
        const index = updateList.findIndex(resource => (
          resource.languageId === languageId &&
          resource.owner === owner &&
          resource.resourceId === resourceId &&
          resource.version === version
        ));
        if (index >= 0) {
          updateList.splice(index, 1);
        }
      }
    }
  }
}

function isCoreResource(item) {
  const isOriginal = (item.languageId === 'el-x-koine' && item.resourceId === 'ugnt') ||
    (item.languageId === 'hbo' && item.resourceId === 'uhb');

  if (!isOriginal) { // skip over any uw repos that are not original langs
    const isEnglish = (item.languageId === 'en');

    if (!isEnglish) { // skip over any filterOrg repos that are not english
      return false;
    }

    const coreRes = isAlignedBible(item) || isOtherResource(item);
    return coreRes;
  }
  return true;
}

function isBibleResource(item) {
  const subject = item.subject;
  const isBible = subject.toUpperCase().includes('BIBLE');
  return isBible;
}

function isOtherResource(item) {
  const notBible = !isBibleResource(item);
  return notBible;
}

function isKeyLanguageResource(item, keyLanguages) {
  const isKeyLanguage = keyLanguages.includes(item.languageId);
  let keep = false;

  if (isKeyLanguage) {
    keep = isCoreResource(item) || isAlignedBibleOrOtherResource(item);
  }
  return keep;
}

function isAlignedBibleOrOtherResource(item) {
  return isAlignedBible(item) || isOtherResource(item);
}

function isAlignedBible(item) {
  const match = 'Aligned_Bible'.toUpperCase();
  const subject = item.subject;

  if (subject.toUpperCase() === match) {
    return true;
  }
  return false;
}

/**
 * strip list down to minimal resources if in filterOrg, original language and optionally English
 * @param {object} sourceContentUpdater
 * @param {string} filterOrg
 * @param {string[]} updateList
 * @param {boolean} addEnglishRes
 */
function getNeededResources(sourceContentUpdater, updateList, keyLanguages) {
  for (const item of sourceContentUpdater.updatedCatalogResources) {
    let keep = false;

    switch (item.owner) {
    case DOOR43_CATALOG:
      keep = isCoreResource(item);
      break;

    case UNFOLDING_WORD:
      keep = isCoreResource(item) || isAlignedBible(item) || isKeyLanguageResource(item, keyLanguages);
      break;

    default: // other orgs
      keep = isAlignedBible(item) || isKeyLanguageResource(item, keyLanguages);
      break;
    }

    if (keep) {
      updateList.push(item);
    }
  }
}

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
    let filterByOwner_ = [...filterByOwner];
    const _UW = uWoriginalLanguage || unfoldingWordOrg;

    if (_UW) {
      filterByOwner_.push(UNFOLDING_WORD);
    }

    if (DOOR43_DEPRECATED) { // turn off the owner filtering if DOOR43_DEPRECATED
      filterByOwner_ = null;
    }

    const latestManifestKey = { Bible: { 'usfm-js': USFMJS_VERSION } };
    const config = {
      latestManifestKey,
      // ignoreDoor43Catalog: DOOR43_DEPRECATED, /// perhaps eventually we can completely ignore
      topic: 'tc-ready',
    };

    if (filterByOwner_?.length) { // if not empty list
      config.filterByOwner = filterByOwner_;
    }

    if (preProd) {
      config.stage = STAGE.PRE_PROD;
    }

    okToZip = true;

    await sourceContentUpdater.getLatestResources(localResourceList, config)
      .then(async () => {
        let updateList = [];
        console.log(`Updated resources count is ${sourceContentUpdater.updatedCatalogResources?.length}`)

        if (_UW) {
          getNeededResources(sourceContentUpdater, updateList, languages);
        } else {
          updateList = sourceContentUpdater.updatedCatalogResources;
        }

        cleanUpLoadAfterResources(updateList);

        await sourceContentUpdater.downloadResources(languages, resourcesPath,
          updateList, // list of static resources that are newer in catalog
          allAlignedBibles)
          .then(resources => {
            if (!resources || !resources.length) {
              console.log('Resources are already up to date');
            }

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
 * get expected files and subpath for resource
 * @param resource
 * @returns {{typePath: *, expectedFiles: string[]}}
 */
function getExpectedFileForResource(resource) {
  let expectedFiles = ['manifest.json', 'contents.zip'];
  let typePath;

  switch (resource.resourceId) {
  case 'ta':
  case 'translationAcademy':
    typePath = TA_PATH;
    break;
  case 'tn':
  case 'translationNotes':
    typePath = TN_PATH;
    break;
  case 'tw':
  case 'translationWords':
    typePath = TW_PATH;
    break;
  case 'twl':
  case 'translationWordsLinks':
    typePath = TWL_PATH;
    break;
    default:
    // default to bible
    typePath = path.join(BIBLES_PATH, resource.resourceId);
    expectedFiles = ['index.json', 'manifest.json', 'books.zip'];
    break;
  }
  return { expectedFiles, typePath };
}

/**
 * validate this resource to have expected files
 * @param resourcesPath
 * @param resource
 * @param typePath
 * @param expectedFiles
 * @param defaultReturn
 * @returns {boolean}
 */
function validateResource(resourcesPath, resource, typePath, expectedFiles, defaultReturn = true) {
  let validResource = defaultReturn; // if we can't identify the resource, skip

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
  return validResource;
}

/**
 * check local resource list to find broken resources, and flag for replacement
 * @param resourceList
 * @param resourcesPath
 */
function checkForBrokenResources(resourceList, resourcesPath) {
  for (const resource of resourceList) {
    // const manifest = resource.manifest || {};
    let validResource = true;
    const { typePath, expectedFiles } = getExpectedFileForResource(resource);
    validResource = validateResource(resourcesPath, resource, typePath, expectedFiles);

    if (!validResource) {
      // break resource item in list, so resource will be replaced
      console.warn(`invalidating resource: ${JSON.stringify(resource)}`);
      resource.version = 'v0';
      resource.languageId = 'zzzz';
    }
  }
}

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
 * Populates resourceList with resources that can be used in scripture pane
 * @param {string} resourcesPath - array to be populated with resources
 */
function validateResources(resourcesPath) {
  console.log(`validateResources() - doing final validation of resources`);
  let validationFailed = false;
  let errors = '';

  try {
    const languagesIds = getFilesInResourcePath(resourcesPath, null, true);
    let helpsPath, biblesPath;

    languagesIds.forEach((languageId) => {
      try {
        biblesPath = path.join(resourcesPath, languageId, 'bibles');

        if (fs.existsSync(biblesPath)) {
          const biblesFolders = getFilesInResourcePath(biblesPath, null, true);

          biblesFolders.forEach(bibleId => {
            const bibleIdPath = path.join(biblesPath, bibleId);

            try {
              const owners = getLatestVersionsAndOwners(bibleIdPath) || {};

              for (const owner of Object.keys(owners)) {
                const resource = {
                  resourceId: bibleId,
                  owner,
                  languageId,
                };
                const { typePath, expectedFiles } = getExpectedFileForResource(resource);
                const validResource_ = validateResource(resourcesPath, resource, typePath, expectedFiles, false);

                if (!validResource_) {
                  errors += `\nValidation Failure for resource: ${JSON.stringify(resource)}`;
                  validationFailed = true;
                }
              }
            } catch (e) {
              console.error(`validateResources() - failed to get latest version bible in ${bibleIdPath}`, e);
              validationFailed = true;
            }
          });
        } else {
          console.warn('validateResources() - Directory not found, ' + biblesPath);
        }
      } catch (e) {
        console.error('validateResources() - Failed to read list of bibles at ' + biblesPath);
        validationFailed = true;
      }

      try {
        helpsPath = path.join(resourcesPath, languageId, 'translationHelps');

        if (fs.existsSync(helpsPath)) {
          const helpsFolders = getFilesInResourcePath(helpsPath, null, true);

          helpsFolders.forEach(helpType => {
            const helpPath = path.join(helpsPath, helpType);

            try {
              const owners = getLatestVersionsAndOwners(helpPath) || {};

              for (const owner of Object.keys(owners)) {
                const resource = {
                  resourceId: helpType,
                  owner,
                  languageId,
                };
                let { typePath, expectedFiles } = getExpectedFileForResource(resource);

                if ((helpType === 'translationWords') && ((languageId === 'el-x-koine') || (languageId === 'hbo'))) {
                  // special case for tWords in original languages does not have manifest.json
                  expectedFiles = expectedFiles.filter(filename => filename !== 'manifest.json');
                }

                const validResource_ = validateResource(resourcesPath, resource, typePath, expectedFiles, false);

                if (!validResource_) {
                  errors += `\nValidation Failure for resource: ${JSON.stringify(resource)}`;
                  validationFailed = true;
                }
              }
            } catch (e) {
              console.error(`validateResources() - failed to get latest version of helps in ${helpPath}`, e);
              validationFailed = true;
            }
          });
        } else {
          // console.log('validateResources() - Directory not found, ' + helpsPath);
        }
      } catch (e) {
        console.error('validateResources() - Failed to read list of bibles at ' + helpsPath);
        validationFailed = true;
      }
    });

    let lexiconValid = validateLexicons(resourcesPath);

    if (!lexiconValid) {
      errors += `\nLexicons are invalid`;
    }

    const BASE_REQUIRED_RESOURCES_DOOR43 = [
      'el-x-koine/bibles/ugnt',
      'el-x-koine/translationHelps/translationWords',
      'en/bibles/ult',
      'en/bibles/ust',
      'hbo/bibles/uhb',
      'hbo/translationHelps/translationWords',
    ];

    const BASE_ORIG_LANG_RESOURCES_DOOR43 = [
      'el-x-koine/bibles/ugnt',
      'el-x-koine/translationHelps/translationWords',
      'en/bibles/ult',
      'hbo/bibles/uhb',
      'hbo/translationHelps/translationWords',
    ];

    const BASE_REQUIRED_RESOURCES_UW = [
      'el-x-koine/bibles/ugnt',
      'en/translationHelps/translationAcademy',
      'en/translationHelps/translationNotes',
      'en/translationHelps/translationWords',
      'en/translationHelps/translationWordsLinks',
      'en/bibles/ult',
      'en/bibles/ust',
      'hbo/bibles/uhb',
    ];

    const BASE_REQUIRED_RESOURCES_FOR_OTHER_OWNERS = [
      'el-x-koine/bibles/ugnt',
      'hbo/bibles/uhb',
    ];

    const _validateResources = { 'Door43-Catalog': BASE_REQUIRED_RESOURCES_DOOR43 };

    if (DOOR43_DEPRECATED) {
      _validateResources.unfoldingWord = BASE_REQUIRED_RESOURCES_UW;
      _validateResources['Door43-Catalog'] = BASE_ORIG_LANG_RESOURCES_DOOR43;
    } else if (unfoldingWordOrg) {
      _validateResources.unfoldingWord = BASE_REQUIRED_RESOURCES_FOR_OTHER_OWNERS;
    };

    for (const owner of Object.keys(_validateResources)) {
      const resourcePaths_ = _validateResources[owner];

      for (const resourcePath of resourcePaths_) {
        const fullPath = path.join(resourcesPath, resourcePath);
        const owners = getLatestVersionsAndOwners(fullPath) || {};
        const latestVersionPath = owners && owners[owner];

        const files = latestVersionPath && getFilesInResourcePath(latestVersionPath, '.zip', false, true);

        if (files && files.length > 0) {
          // success, have at least one zip file
        } else {
          console.error(`validateResources() - FAILED validation of ${fullPath}`);
          validationFailed = true;
          errors += `\nFAILED validation of ${fullPath}`;
        }
      }
    }
  } catch (e) {
    console.error('validateResources() - FAILED: ', e);
    validationFailed = true;
  }

  if (validationFailed && !errors) {
    errors = 'General validation failure';
  }
  return errors;
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
 * check if resource is valid
 * @param {string} fullPath
 * @param {string} owner
 * @returns {{latestVersionPath: (""|*), isValid: boolean, files: (""|*|Array)}}
 */
function isValidResource(fullPath, owner) {
  const owners = getLatestVersionsAndOwners(fullPath) || {};
  const latestVersionPath = owners && owners[owner];

  const files = latestVersionPath && getFilesInResourcePath(latestVersionPath, '.zip', false, true);
  return {
    files,
    isValid: !!files?.length,
    latestVersionPath
  };
}

/**
 * check for missing tWords resources for original languages - for backwards compatibility in Door43-Catalog and tCore
 *   Recover by copying english twl resource
 * @param resourcesPath
 */
function fixForTwordsForOriginalLangs(resourcesPath) {
  const tWordsPaths = [
    'el-x-koine/translationHelps/translationWords',
    'hbo/translationHelps/translationWords'
  ];
  for (const tWpath of tWordsPaths) {
    const tWlPath = path.join(resourcesPath, tWpath);
    const {isValid} = isValidResource(tWlPath, DOOR43_CATALOG);
    if (!isValid) {
      const fullPath_ = path.join(resourcesPath, 'en/translationHelps/translationWordsLinks');
      for (const owner of [DOOR43_CATALOG, CN_CATALOG]) {
        const {isValid: isValid_, latestVersionPath} = isValidResource(fullPath_, owner);
        if (isValid_) {
          let dest;
          try {
            versionName = path.parse(latestVersionPath).base;
            versionName = versionName.replace(owner, DOOR43_CATALOG);
            dest = path.join(tWlPath, versionName);
            fs.copySync(latestVersionPath, dest);
            break;
          } catch (e) {
            console.error(`Could not move ${latestVersionPath} to ${dest}`);
          }
        }
      }
    }
  }
}

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

  if (unfoldingWordOrg) {
    filterByOwner.push('unfoldingWord')
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
      okToZip = false;
      console.error('executeResourcesUpdate() - Errors on downloading updated resources!!', errors);
    }

    if (okToZip) {
      console.log('executeResourcesUpdate() - Zipping up updated resources');

      languages.forEach(async (languageId) => {
        try {
          await zipResourcesContent(resourcesPath, languageId);
        } catch (e) {
          errors += e.toString() + '\n';
        }
      });

      fixForTwordsForOriginalLangs(resourcesPath);

      const errors2 = validateResources(resourcesPath);

      if (errors2) {
        okToZip = false;
        console.error('executeResourcesUpdate() - Errors on final validation!!', errors);
        errors += '\n' + errors2;
      }
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
  const allAlignedBibles = findFlag(flags, '--allAlignedBibles'); // include all aligned bibles in package
  const uWoriginalLanguage = findFlag(flags, '--uWoriginalLanguage'); // include original language resources from unfoldingWord org
  unfoldingWordOrg = findFlag(flags, '--unfoldingWordOrg'); // include all resources from unfoldingWord org
  preProd = findFlag(flags, '--preProd'); // include pre-release resources

  if (! fs.existsSync(resourcesPath)) {
    console.error('Directory does not exist: ' + resourcesPath);
    process.exitCode = 1; // set exit error code
    return;
  }

  executeResourcesUpdate(languages, resourcesPath, allAlignedBibles, uWoriginalLanguage).then(code => {
    process.exitCode = code; // set exit code, 0 = no error
  });
}
