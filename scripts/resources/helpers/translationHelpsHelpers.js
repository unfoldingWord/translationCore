/* eslint-disable no-console */
import fs from 'fs-extra';
import path from 'path-extra';
import yaml from 'yamljs';
// helpers
import * as biblesHelpers from './biblesHelpers';

/**
 * 
 * @param {String} extractedFilePath 
 * @param {String} RESOURCE_OUTPUT_PATH 
 */
export function getTranslationHelps(extractedFilePath, RESOURCE_OUTPUT_PATH) {
  console.log(
    '\x1b[33m%s\x1b[0m',
    'Generating tC compatible resource data structure ...',
  );
  const resourceManifest = biblesHelpers.getResourceManifestFromYaml(
    extractedFilePath,
  );
  const folders = ['kt', 'other'];
  const occurrences = getOccurences(extractedFilePath);

  folders.forEach(folderName => {
    const filesPath = path.join(extractedFilePath, 'bible', folderName);
    const resourceVersion = 'v' + resourceManifest.dublin_core.version;
    const files = fs.readdirSync(filesPath);

    let groupsIndex = generateGroupsIndex(filesPath, RESOURCE_OUTPUT_PATH, resourceVersion, folderName);

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

      generateGroupsData(occurrences, fileName, RESOURCE_OUTPUT_PATH, groupsIndex, folderName, resourceVersion);
    });
  });
}

/**
 * 
 * @param {String} extractedFilePath 
 */
function getOccurences(extractedFilePath) {
  const filePath = path.join(extractedFilePath, 'bible', 'config.yaml');
  let yamlOccurences = fs.readFileSync(filePath, 'utf8');
  return yaml.parse(yamlOccurences);
}

/**
 * This function generates the groups index for the tw articles (both kt and other).
 * @param {String} filesPath - Path to all tw markdown artciles.
 * @param {String} RESOURCE_OUTPUT_PATH Path to the resource location in the static folder.
 * @param {String} resourceVersion resources version number.
 * @param {String} folderName article type. ex. kt or other.
 */
function generateGroupsIndex(filesPath, RESOURCE_OUTPUT_PATH, resourceVersion, folderName) {
  let groupsIndex = [];
  let groupIds = fs.readdirSync(filesPath);
  groupIds.forEach(fileName => {
    let groupObjet = {};
    const filePath = path.join(filesPath, fileName);
    const articleFile = fs.readFileSync(filePath, 'utf8');

    const groupId = fileName.replace('.md', '');
    const groupName = articleFile.split('\n')[0].replace(/ #|# /gi, '');

    groupObjet.id = groupId;
    groupObjet.name = groupName;
    groupsIndex.push(groupObjet);
  });

  const groupsIndexOutputPath = path.join(
    RESOURCE_OUTPUT_PATH,
    resourceVersion,
    folderName,
    'index.json',
  );

  fs.outputJsonSync(groupsIndexOutputPath, groupsIndex);

  return groupsIndex;
}

/**
 * 
 * @param {object} occurrences 
 * @param {String} fileName 
 * @param {String} extractedFilePath 
 * @param {object} groupsIndex 
 * @param {String} folderName 
 */
function generateGroupsData(occurrences, fileName, RESOURCE_OUTPUT_PATH, groupsIndex, folderName, resourceVersion) {
  const articleName = fileName.replace('.md', '');
  if (occurrences[articleName]) {
    const wordOccurrences = occurrences[
      articleName
    ].occurrences.map(occurrencesString => {
      let reference = occurrencesString
        .replace('rc://en/ulb/book/', '')
        .split('/');
      return {
        priority: 1,
        comments: false,
        reminders: false,
        selections: false,
        verseEdits: false,
        contextId: {
          reference: {
            bookId: reference[0],
            chapter: parseInt(reference[1], 10),
            verse: parseInt(reference[2], 10)
          },
          tool: 'translationWords',
          groupId: articleName,
          quote: getGroupName(articleName, groupsIndex),
          occurrence: 1
        }
      };
    });

    wordOccurrences.forEach(wordObject => {
      const bookId = wordObject.contextId.reference.bookId;
      const fileName = articleName + '.json';
      const groupsSavePath = path.join(
        RESOURCE_OUTPUT_PATH,
        resourceVersion,
        folderName,
        'groups',
        bookId,
        fileName,
      );
      let groupData = wordOccurrences.filter(wordOcurrence => {
        return bookId === wordOcurrence.contextId.reference.bookId;
      });

      fs.outputJsonSync(groupsSavePath, groupData);
    });
  }
}

/**
 * 
 * @param {String} articleName 
 * @param {object} groupsIndex 
 */
function getGroupName(articleName, groupsIndex) {
  let groupObject = groupsIndex.filter(group => {
    return group.id.toLowerCase() === articleName;
  });

  return groupObject[0].name;
}
