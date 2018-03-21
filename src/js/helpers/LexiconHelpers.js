import fs from 'fs-extra';
import path from 'path-extra';
import ospath from 'ospath';
// constants
const USER_RESOURCES_PATH = path.join(ospath.home(), 'translationCore', 'resources');

export function getLexiconData(lexiconId, entryId) {
  try {
    const languageId = 'en';
    const resourceVersion = 'v0';
    // generate path from resourceType and articleId
    const lexiconPath = path.join(USER_RESOURCES_PATH, languageId, 'lexicons', lexiconId, resourceVersion, 'content');
    const entryPath = path.join(lexiconPath, entryId + '.json');
    let entryData;
    if (fs.existsSync(entryPath)) {
      entryData = fs.readJsonSync(entryPath, 'utf8'); // get file from fs
    }
    return {
      [lexiconId]: {
        [entryId]: entryData
      }
    };
  } catch (error) {
    console.error(error);
  }
}
