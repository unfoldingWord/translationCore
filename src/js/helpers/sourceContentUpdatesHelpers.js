import fs from 'fs-extra';
import path from 'path-extra';
import ospath from 'ospath';

const USER_RESOURCES_PATH = path.join(ospath.home(), 'translationCore/resources');

const cleanReaddirSync = (path) => {
  const cleanDirectories = fs.readdirSync(path)
    .filter(file => file !== '.DS_Store');

  return cleanDirectories;
};

export const getLocalResourceList = () => {
  const localResourceList = [];
  const resourceLanguages = fs.readdirSync(USER_RESOURCES_PATH)
    .filter(file => path.extname(file) !== '.json' && file !== '.DS_Store');

  for (let i = 0; i < resourceLanguages.length; i++) {
    const languageId = resourceLanguages[i];
    const biblesPath = path.join(USER_RESOURCES_PATH, languageId, 'bibles');
    const tHelpsPath = path.join(USER_RESOURCES_PATH, languageId, 'translationHelps');
    const bibleIds = cleanReaddirSync(biblesPath);
    const tHelpsResources = cleanReaddirSync(tHelpsPath);

    bibleIds.forEach(bibleId => {
      const bibleIdPath = path.join(biblesPath, bibleId);
      const bibleIdContents = cleanReaddirSync(bibleIdPath);

      const resourceManifest = fs.readJsonSync(path.join(bibleIdPath, bibleIdContents[0], 'manifest.json'));
      const localResource = {
        languageId: languageId,
        resourceId: bibleId,
        modifiedTime: resourceManifest.dublin_core.modified
      };

      localResourceList.push(localResource);
    });

    tHelpsResources.forEach(tHelpsId => {
      const tHelpResource = path.join(tHelpsPath, tHelpsId);
      const tHelpResourceContents = cleanReaddirSync(tHelpResource);

      const resourceManifest = fs.readJsonSync(path.join(tHelpResource, tHelpResourceContents[0], 'manifest.json'));
      const localResource = {
        languageId: languageId,
        resourceId: tHelpsId,
        modifiedTime: resourceManifest.dublin_core.modified
      };

      localResourceList.push(localResource);
    });
  }
  return localResourceList;
};
