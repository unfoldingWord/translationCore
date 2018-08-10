import fs from 'fs-extra';
import path from 'path-extra';
import ospath from 'ospath';
// heleprs
import * as ResourcesHelpers from '../ResourcesHelpers';

/**
 * @description - Processes the translationAcademy article files for a given language from the extracted files from the catalog
 * @param {String} extractedFilePath
 * @param {String} lang
 * @returns {String} the path to the processed translationAcademy directory
 */
export function processTranslationAcademy(extractedFilePath, lang) {
  if (! fs.pathExistsSync(extractedFilePath)) {
    return null;
  }
  const resourceManifest = ResourcesHelpers.getResourceManifest(extractedFilePath);
  const resourceVersion = 'v' + resourceManifest.dublin_core.version;
  const taOutputPath = path.join(ospath.home(), 'translationCore/resources', lang, 'translationHelps/translationAcademy', resourceVersion);
  if (fs.pathExistsSync(taOutputPath)) {
    fs.removeSync(taOutputPath);
  }
  resourceManifest.projects.forEach(project => {
    const folderPath = path.join(extractedFilePath, project.path);
    const isDirectory = item => fs.lstatSync(path.join(folderPath, item)).isDirectory();
    const articleDirs = fs.readdirSync(folderPath).filter(isDirectory);
    articleDirs.forEach(articleDir => {
      let content = '# '+fs.readFileSync(path.join(folderPath, articleDir, 'title.md'), 'utf8')+' #\n';
      content += fs.readFileSync(path.join(folderPath, articleDir, '01.md'), 'utf8');
      const destinationPath = path.join(
        taOutputPath,
        project.path,
        articleDir+'.md'
      );
      fs.outputFileSync(destinationPath, content);
    });
  });
  return taOutputPath;
}
