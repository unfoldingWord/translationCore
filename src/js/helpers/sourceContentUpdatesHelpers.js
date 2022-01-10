import fs from 'fs-extra';
import path from 'path-extra';
// constants
import { USER_RESOURCES_PATH, TRANSLATION_HELPS } from '../common/constants';
// helpers
import ResourceAPI from './ResourceAPI';

const cleanReaddirSync = (path) => {
  let cleanDirectories = [];

  if (fs.existsSync(path)) {
    cleanDirectories = fs.readdirSync(path)
      .filter(file => file !== '.DS_Store');
  } else {
    console.warn(`no such file or directory, ${path}`);
  }

  return cleanDirectories;
};

export const getLocalResourceList = () => {
  try {
    if (!fs.existsSync(USER_RESOURCES_PATH)) {
      fs.ensureDirSync(USER_RESOURCES_PATH);
    }

    const localResourceList = [];
    const resourceLanguages = fs.readdirSync(USER_RESOURCES_PATH)
      .filter(file => path.extname(file) !== '.json' && file !== '.DS_Store');

    for (let i = 0; i < resourceLanguages.length; i++) {
      const languageId = resourceLanguages[i];
      const biblesPath = path.join(USER_RESOURCES_PATH, languageId, 'bibles');
      const tHelpsPath = path.join(USER_RESOURCES_PATH, languageId, TRANSLATION_HELPS);
      const bibleIds = cleanReaddirSync(biblesPath);
      const tHelpsResources = cleanReaddirSync(tHelpsPath);

      bibleIds.forEach(bibleId => {
        const bibleIdPath = path.join(biblesPath, bibleId);
        const bibleLatestVersion = ResourceAPI.getLatestVersion(bibleIdPath);

        if (bibleLatestVersion) {
          const pathToBibleManifestFile = path.join(bibleLatestVersion, 'manifest.json');

          if (fs.existsSync(pathToBibleManifestFile)) {
            const resourceManifest = fs.readJsonSync(pathToBibleManifestFile);
            const localResource = {
              languageId: languageId,
              resourceId: bibleId,
              modifiedTime: resourceManifest.remoteModifiedTime || resourceManifest.catalog_modified_time,
            };

            localResourceList.push(localResource);
          } else {
            console.warn(`no such file or directory, ${pathToBibleManifestFile}`);
          }
        } else {
          console.log(`$bibleLatestVersion is ${bibleLatestVersion}.`);
        }
      });

      tHelpsResources.forEach(tHelpsId => {
        const tHelpResource = path.join(tHelpsPath, tHelpsId);
        const tHelpsLatestVersion = ResourceAPI.getLatestVersion(tHelpResource);

        if (tHelpsLatestVersion) {
          const pathTotHelpsManifestFile = path.join(tHelpsLatestVersion, 'manifest.json');

          if (fs.existsSync(pathTotHelpsManifestFile)) {
            const resourceManifest = fs.readJsonSync(pathTotHelpsManifestFile);
            const localResource = {
              languageId: languageId,
              resourceId: tHelpsId,
              modifiedTime: resourceManifest.remoteModifiedTime || resourceManifest.catalog_modified_time,
            };

            localResourceList.push(localResource);
          } else {
            console.warn(`no such file or directory, ${pathTotHelpsManifestFile}`);
          }
        } else {
          console.log(`$tHelpsLatestVersion is ${tHelpsLatestVersion}.`);
        }
      });
    }
    return localResourceList;
  } catch (error) {
    console.error(error);
    return null;
  }
};
