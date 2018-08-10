import fs from 'fs-extra';
import path from 'path-extra';
import ospath from 'ospath';
// heleprs
import * as ResourcesHelpers from '../ResourcesHelpers';

/**
 * @description - Processes the translationWords article files for a given language from the extracted files from the catalog
 * @param {String} extractedFilePath
 * @param {String} lang
 * @returns {String} the path to the processed translationWords directory
 */
export function processTranslationWords(extractedFilePath, lang) {
  if (! fs.pathExistsSync(extractedFilePath)) {
    return null;
  }
  const resourceManifest = ResourcesHelpers.getResourceManifest(extractedFilePath);
  const resourceVersion = 'v' + resourceManifest.dublin_core.version;
  const twOutputPath = path.join(ospath.home(), 'translationCore/resources', lang, 'translationHelps/translationWords', resourceVersion);
  if (fs.pathExistsSync(twOutputPath)) {
    fs.removeSync(twOutputPath);
  }
  const typesPath = path.join(extractedFilePath, 'bible');
  const isDirectory = item => fs.lstatSync(path.join(typesPath, item)).isDirectory();
  const typeDirs = fs.readdirSync(typesPath).filter(isDirectory);
  typeDirs.forEach(typeDir => {
    const typePath = path.join(typesPath, typeDir);
    const files = fs.readdirSync(typePath).filter(filename=>path.extname(filename)==='.md');
    generateGroupsIndex(typePath, twOutputPath, typeDir);
    files.forEach(fileName => {
      const sourcePath = path.join(typePath, fileName);
      const destinationPath = path.join(
        twOutputPath,
        typeDir,
        'articles',
        fileName,
      );
      fs.copySync(sourcePath, destinationPath);
    });
  });
  return twOutputPath;
}

/**
 * @description - Generates the groups index for the tw articles (both kt, other and names).
 * @param {String} filesPath - Path to all tw markdown artciles.
 * @param {String} twOutputPath Path to the resource location in the static folder.
 * @param {String} folderName article type. ex. kt or other.
 */
function generateGroupsIndex(filesPath, twOutputPath, folderName) {
  let groupsIndex = [];
  let groupIds = fs.readdirSync(filesPath).filter(filename => {
    return filename.split('.').pop() == 'md';
  });
  groupIds.forEach(fileName => {
    let groupObject = {};
    const filePath = path.join(filesPath, fileName);
    const articleFile = fs.readFileSync(filePath, 'utf8');
    const groupId = fileName.replace('.md', '');
    // get the article's first line and remove #'s and spaces from beginning/end
    const groupName = articleFile.split('\n')[0].replace(/(^\s*#\s*|\s*#\s*$)/gi, '');
    groupObject.id = groupId;
    groupObject.name = groupName;
    groupsIndex.push(groupObject);
  });
  groupsIndex.sort(compareByFirstUniqueWord);
  const groupsIndexOutputPath = path.join(
    twOutputPath,
    folderName,
    'index.json',
  );

  fs.outputJsonSync(groupsIndexOutputPath, groupsIndex, {spaces:2});
}

/**
 * Splits the string into words delimited by commas and compares the first unique word
 * @param {String} a
 * @param {String} b
 */
function compareByFirstUniqueWord(a, b) {
  let aWords = a.name.toUpperCase().split(',');
  let bWords = b.name.toUpperCase().split(',');
  while (aWords.length || bWords.length) {
    if (! aWords.length)
      return -1;
    if (! bWords.length)
      return 1;
    let aWord = aWords.shift().trim();
    let bWord = bWords.shift().trim();
    if (aWord != bWord)
      return (aWord<bWord?-1:1);
  }
  return 0; // both lists are the same
}
