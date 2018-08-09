import fs from 'fs-extra';
import path from 'path-extra';
import ospath from 'ospath';
import yaml from 'yamljs';

/**
 *
 * @param {String} extractedFilePath
 * @param {String} RESOURCE_OUTPUT_PATH
 */
export function setupTranslationAcademy(extractedFilePath, lang) {
  const resourceManifest = getResourceManifestFromYaml(extractedFilePath);
  const resourceVersion = 'v' + resourceManifest.dublin_core.version;
  const taOutputPath = path.join(ospath.home(), 'translationCore/resources', lang, 'translationHelps/translationAcademy', resourceVersion);
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

/**
 *
 * @param {String} extractedFilePath
 */
function getResourceManifestFromYaml(extractedFilePath) {
  try {
    const filePath = path.join(extractedFilePath, 'manifest.yaml');
    const yamlManifest = fs.readFileSync(filePath, 'utf8');
    return yaml.parse(yamlManifest);
  } catch (error) {
    console.error(error);
  }
}
