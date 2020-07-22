/**
 * This script updates the resources in a given directory for the given languages
 * Syntax: node scripts/resources/updateResources.js <path to resources> <language> [language...]
 */
require('babel-polyfill'); // required for async/await
const path = require('path-extra');
const fs = require('fs-extra');
const SourceContentUpdater = require('tc-source-content-updater').default;
const UpdateResourcesHelpers = require('./updateResourcesHelpers');
const zipResourcesContent = require('./zipHelpers').zipResourcesContent;

/**
 * find resources to update
 * @param {String} languages - languages to update resources
 * @param {String} resourcesPath
 * @param {Boolean} allAlignedBibles - if true then all aligned bibles from all languages are updated also
 * @return {Promise<String>}
 */
const updateResources = async (languages, resourcesPath, allAlignedBibles) => {
  const sourceContentUpdater = new SourceContentUpdater();

  try {
    const localResourceList = UpdateResourcesHelpers.getLocalResourceList(resourcesPath);

    await sourceContentUpdater.getLatestResources(localResourceList)
      .then(async () => {
        await sourceContentUpdater.downloadResources(languages, resourcesPath, null, allAlignedBibles)
          .then(resources => {
            resources.forEach(resource => {
              console.log('Updated resource \'' + resource.resourceId + '\' for language \'' + resource.languageId + '\' to v' + resource.version);
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

const executeResourcesUpdate = async (languages, resourcesPath, allAlignedBibles) => {
  let errors = false;

  if (areResourcesRecent(resourcesPath)) {
    console.log('Resources recently updated, so nothing to do');
  } else {
    const importsPath = path.join(resourcesPath, 'imports');// Remove old imports folder

    if (fs.existsSync(importsPath)) { // do safe folder delete of imports
      const tempPath = importsPath + '.temp';
      fs.moveSync(importsPath, tempPath);
      fs.removeSync(tempPath);
    }

    errors = await updateResources(languages, resourcesPath, allAlignedBibles);

    if (errors) {
      console.log('Errors on downloading updated resources!!');
    }
    console.log('Zipping up updated resources');

    languages.forEach(async (languageId) => {
      try {
        await zipResourcesContent(resourcesPath, languageId);
      } catch (e) {
        errors += e.toString() + '\n';
      }
    });

    // update source content updater manifest, but don't clobber tCore version
    UpdateResourcesHelpers.updateSourceContentUpdaterManifest(resourcesPath);
  }

  if (errors) {
    console.log('Errors on downloading updated resources:\n' + errors);
    return 1; // error
  }
  console.log('Updating Succeeded!!!');
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
  const allAlignedBibles = findFlag(flags, '---allAlignedBibles');

  if (! fs.existsSync(resourcesPath)) {
    console.error('Directory does not exist: ' + resourcesPath);
    process.exitCode = 1; // set exit error code
    return;
  }

  executeResourcesUpdate(languages, resourcesPath, allAlignedBibles).then(code => {
    process.exitCode = code; // set exit code, 0 = no error
  });
}
