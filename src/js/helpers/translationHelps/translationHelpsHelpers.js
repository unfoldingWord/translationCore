import fs from 'fs-extra';
import path from 'path-extra';
import yaml from 'yamljs';

/**
 *
 * @param {String} extractedFilePath
 * @param {String} RESOURCE_OUTPUT_PATH
 */
export function getTranslationWords(extractedFilePath, RESOURCE_OUTPUT_PATH) {
  console.log(
    '\x1b[33m%s\x1b[0m',
    'Generating tW resource data structure ...',
  );
  const resourceManifest = getResourceManifestFromYaml(extractedFilePath);
  const resourceVersion = 'v' + resourceManifest.dublin_core.version;
  const folders = ['kt', 'names', 'other'];

  folders.forEach(folderName => {
    const filesPath = path.join(extractedFilePath, 'bible', folderName);
    const files = fs.readdirSync(filesPath).filter(filename => {
      return filename.split('.').pop() == 'md';
    });

    generateGroupsIndex(filesPath, RESOURCE_OUTPUT_PATH, resourceVersion, folderName);

    files.forEach(fileName => {
      const sourcePath = path.join(filesPath, fileName);
      const destinationPath = path.join(
        RESOURCE_OUTPUT_PATH,
        resourceVersion,
        folderName,
        'articles',
        fileName,
      );
      fs.copySync(sourcePath, destinationPath);
    });
  });
}

/**
 *
 * @param {String} extractedFilePath
 * @param {String} RESOURCE_OUTPUT_PATH
 */
export function getTranslationAcademy(extractedFilePath, RESOURCE_OUTPUT_PATH) {
  console.log(
    '\x1b[33m%s\x1b[0m',
    'Generating tA resource data structure ...',
  );
  const resourceManifest = biblesHelpers.getResourceManifestFromYaml(extractedFilePath);
  const resourceVersion = 'v' + resourceManifest.dublin_core.version;
  resourceManifest.projects.forEach(project => {
    const folderPath = path.join(extractedFilePath, project.path);
    const isDirectory = item => fs.lstatSync(path.join(folderPath, item)).isDirectory();
    const articleDirs = fs.readdirSync(folderPath).filter(isDirectory);
    articleDirs.forEach(articleDir => {
      let content = '# '+fs.readFileSync(path.join(folderPath, articleDir, 'title.md'), 'utf8')+' #\n';
      content += fs.readFileSync(path.join(folderPath, articleDir, '01.md'), 'utf8');
      const destinationPath = path.join(
        RESOURCE_OUTPUT_PATH,
        resourceVersion,
        project.path,
        articleDir+'.md'
      );
      fs.outputFileSync(destinationPath, content);
    });
  });
}

/**
 * This function generates the groups index for the tw articles (both kt, other and names).
 * @param {String} filesPath - Path to all tw markdown artciles.
 * @param {String} RESOURCE_OUTPUT_PATH Path to the resource location in the static folder.
 * @param {String} resourceVersion resources version number.
 * @param {String} folderName article type. ex. kt or other.
 */
function generateGroupsIndex(filesPath, RESOURCE_OUTPUT_PATH, resourceVersion, folderName) {
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
    RESOURCE_OUTPUT_PATH,
    resourceVersion,
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
export function compareByFirstUniqueWord(a, b) {
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

/**
 *
 * @param {String} extractedFilePath
 */
export function getResourceManifestFromYaml(extractedFilePath) {
  try {
    const filePath = path.join(extractedFilePath, 'manifest.yaml');
    const yamlManifest = fs.readFileSync(filePath, 'utf8');
    return yaml.parse(yamlManifest);
  } catch (error) {
    console.error(error);
  }
}
