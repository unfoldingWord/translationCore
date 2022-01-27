import fs from 'fs-extra';
import path from 'path-extra';
// helpers
import { getTranslate } from '../selectors';
import * as BooksOfTheBible from '../common/BooksOfTheBible';
import {
  PROJECTS_PATH,
  USER_RESOURCES_PATH,
  TRANSLATION_WORDS,
  TRANSLATION_HELPS,
} from '../common/constants';
import * as MissingVersesHelpers from './ProjectValidation/MissingVersesHelpers';
import * as GogsApiHelpers from './GogsApiHelpers';
import * as manifestHelpers from './manifestHelpers';
import * as BibleHelpers from './bibleHelpers';
import ResourceAPI from './ResourceAPI';
import { getFoldersInResourceFolder } from './ResourcesHelpers';

/**
 * function to make the change in the array based on the passed params
 * i.e. If the value is present in the array and you pass the value of
 * false it will be deleted from the array
 */
export function updateArray(array, id, value) {
  const exists = array.indexOf(id) >= 0;

  if (exists && value === true) {
    return array;
  }

  if (exists && value === false) {
    return array.filter((el) => el !== id);
  }

  if (!exists && value === true) {
    return array.concat(id);
  }
  return array;
}

/**
 * returns true if project name needs to be updated to match spec
 * @param {Object} manifest
 * @param {String} projectSaveLocation
 * @return {Object} - {Boolean} repoNeedsRenaming, {Boolean} newRepoExists, {String} newProjectName
 */
export function shouldProjectNameBeUpdated(manifest, projectSaveLocation) {
  let repoNeedsRenaming = false;
  let newRepoExists = false;
  let newProjectName = null;

  if (projectSaveLocation) {
    newProjectName = generateNewProjectName(manifest);
    const currentProjectName = path.basename(projectSaveLocation);
    repoNeedsRenaming = currentProjectName !== newProjectName;
    const newProjectPath = path.join(path.dirname(projectSaveLocation), newProjectName);
    newRepoExists = fs.existsSync(newProjectPath);
  }
  return {
    repoNeedsRenaming, newRepoExists, newProjectName,
  };
}

/**
 * returns true if project name already exists in projects
 * @param {String} newProjectName
 * @return {Boolean}
 */
export function doesProjectAlreadyExist(newProjectName) {
  const newProjectPath = path.join(PROJECTS_PATH, newProjectName);
  return fs.existsSync(newProjectPath);
}

/**
 * format string with details for help desk
 * @param translateKey
 * @return {Function}
 */
export function getFeedbackDetailsForHelpDesk(translateKey) {
  return (async (dispatch, getState) => {
    const state = getState();
    const translate = getTranslate(state);
    const { userdata } = state.loginReducer;
    const { projectSaveLocation } = state.projectDetailsReducer;
    const projectInfo = await GogsApiHelpers.getProjectInfo(projectSaveLocation, userdata);
    return translate(translateKey, projectInfo);
  });
}

/**
 * test to see if project name already exists on repo
 * @param {String} newFilename
 * @param {Object} userdata
 * @return {Promise<any>} - resolve returns boolean that file exists
 */
export function doesDcsProjectNameAlreadyExist(newFilename, userdata) {
  return new Promise((resolve, reject) => {
    GogsApiHelpers.findRepo(userdata, newFilename).then(repo => {
      const repoExists = !!repo;
      resolve(repoExists);
    }).catch((e) => {
      console.log(e);
      reject(e);
    });
  });
}

/**
 * separate book and language
 * @param projectName
 * @return {{bookId: string, languageId: *}}
 */
export function getDetailsFromProjectName(projectName, translate) {
  let bookId = '';
  let bookName = '';
  let languageId = '';

  if (projectName) {
    const parts = projectName.split('_');
    languageId = parts[0];

    // we can have a bunch of old formats (e.g. en_act, aaw_php_text_reg) and new format (en_ult_tit_book)
    for (let i = 1; i < parts.length; i++) { // iteratively try the fields to see if valid book ids
      const possibleBookId = parts[i].toLowerCase();
      const allBooks = BooksOfTheBible.getAllBibleBooks(translate);
      bookName = allBooks[possibleBookId];

      if (bookName) {
        bookId = possibleBookId; // if valid bookName use this book id
        break;
      }
    }
  }
  return {
    bookId, languageId, bookName,
  };
}
/**
 * generate new project name to match spec
 * @param manifest
 * @return {string}
 */
export const generateNewProjectName = (manifest) => {
  let newFilename = '';
  const lang_id = manifest.target_language && manifest.target_language.id ? manifest.target_language.id : '';
  const resourceId = manifest.resource && manifest.resource.id ? manifest.resource.id : '';
  const projectId = manifest.project && manifest.project.id ? manifest.project.id : '';
  const resourceType = 'book'; //TODO blm:  hard coded for now

  if (resourceId) {
    newFilename = `${lang_id}_${resourceId}_${projectId}_${resourceType}`;
  } else {
    newFilename = `${lang_id}_${projectId}_${resourceType}`;
  }
  return newFilename.toLowerCase();
};

/**
 * determine what to display for project label and for hover text.  First if there is no project nickname, the project
 *  name is used, else uses projectNickname for project label.  Next if project label is shorter than maximum
 *  length, then full label is displayed and hover text is empty.  Otherwise truncated project label is displayed and
 *  full project label is shown as hover text.
 * @param isProjectLoaded
 * @param projectName
 * @param translate
 * @param projectNickname
 * @param project_max_length
 * @return {{hoverProjectName: String, displayedProjectLabel: String}}
 */
export function getProjectLabel(isProjectLoaded, projectName, translate, projectNickname, project_max_length) {
  const projectLabel = isProjectLoaded ? projectName : translate('project');
  const hoverProjectName = projectNickname || '';
  let displayedProjectLabel = projectLabel || '';

  if (displayedProjectLabel && (displayedProjectLabel.length > project_max_length)) {
    displayedProjectLabel = displayedProjectLabel.substr(0, project_max_length - 1) + '…'; // truncate with ellipsis
  }
  return { hoverProjectName, displayedProjectLabel };
}

/**
 * get list of json files in folder
 * @param {String} folderPath
 * @return {*}
 */
export function getJsonFilesInPath(folderPath) {
  return fs.readdirSync(folderPath).filter(file => path.extname(file) === '.json');
}

/**
 * Gets a tool's progress
 * @param {string} pathToProjectGroupsDataFiles
 * @param toolName
 * @param userSelectedCategories
 * @param bookAbbreviation
 */
export function getToolProgress(pathToProjectGroupsDataFiles, toolName, userSelectedCategories = [], bookAbbreviation) {
  let progress = 0;

  if (fs.existsSync(pathToProjectGroupsDataFiles)) {
    //Getting all the groups data that exist in the project
    //Note: Not all of these may be used for the counting because
    //Some groups here are not apart of the currently selected categories
    const projectGroupsData = getJsonFilesInPath(pathToProjectGroupsDataFiles);
    let availableCheckCategories = [];
    let languageId = 'en';

    if (toolName === TRANSLATION_WORDS){
      const { languageId: origLang } = BibleHelpers.getOrigLangforBook(bookAbbreviation);
      //Note: translationWords only uses checks that are also available in the original language
      languageId = origLang;
    }

    const toolResourcePath = path.join(USER_RESOURCES_PATH, languageId, TRANSLATION_HELPS, toolName);
    const versionPath = ResourceAPI.getLatestVersion(toolResourcePath) || toolResourcePath;
    const parentCategories = getFoldersInResourceFolder(versionPath);

    parentCategories.forEach((category) => {
      const groupsFolderPath = path.join(category, 'groups', bookAbbreviation);
      const groupsDataSourcePath = path.join(versionPath, groupsFolderPath);

      if (fs.existsSync(groupsDataSourcePath)) {
        let subCategories = getJsonFilesInPath(groupsDataSourcePath);

        subCategories = subCategories.filter(subCategory => {
          const name = path.parse(subCategory).name;
          return userSelectedCategories.includes(name);
        });
        //Note: All checks here need to be accounted for in the progress because the
        //user selected these categories and it exist in the resources
        availableCheckCategories = availableCheckCategories.concat({
          category,
          checksToBeCounted: subCategories,
        });
      }
    });

    //Here we are setting up the object to be calculated for progress
    //The data is either going to come from the users local project groupsData
    //Or if the user has not explicitly opened the project yet then it will come from
    //the greek source path because that groupsData only gets copied to the project
    //groupsData after being selected and opened.
    let groupsDataToBeCounted = {};

    availableCheckCategories.forEach(({ checksToBeCounted, category }) => {
      checksToBeCounted.forEach((groupDataFileName) => {
        if (projectGroupsData.includes(groupDataFileName)) {
          //This means that the user has opened the tool with these checks selected before and
          //They are available to read from the project folder
          const groupData = fs.readJsonSync(path.join(pathToProjectGroupsDataFiles, groupDataFileName));
          groupsDataToBeCounted[groupDataFileName.replace('.json', '')] = groupData;
        } else {
          //This means that the check needs to be accounted for in the progress but the user
          //has not opened that check category yet so it is not in the local project folder
          //Grabbing the default groupObject from the OL resource which will have no selections
          const groupsFolderPath = path.join(category, 'groups', bookAbbreviation);
          const groupsDataSourcePath = path.join(versionPath, groupsFolderPath);
          groupsDataToBeCounted[groupDataFileName.replace('.json', '')] = fs.readJsonSync(path.join(groupsDataSourcePath, groupDataFileName));
        }
      });
    });

    if (availableCheckCategories.length) {
      progress = calculateProgress(groupsDataToBeCounted);
    }
  }
  return progress;
}

/**
 * @description generates the progress percentage
 * @param {object} groupsData - all of the data to calculate percentage from
 * @return {double} - percentage number returned
 */
function calculateProgress(groupsData) {
  let percent;
  const groupIds = Object.keys(groupsData);
  let totalChecks = 0, completedChecks = 0;

  // Loop through all checks and tally completed and totals
  groupIds.forEach(groupId => {
    const groupData = groupsData[groupId];

    groupData.forEach(check => {
      totalChecks += 1;
      // checks are considered completed if selections
      completedChecks += (check.selections || check.nothingToSelect) ? 1 : 0;
    });
  });
  // calculate percentage by dividing total by completed
  percent = Math.round(completedChecks / totalChecks * 100) / 100;
  return percent;
}

export function getWordAlignmentProgress(pathToWordAlignmentData, bookId) {
  const groupsObject = {};
  let checked = 0;
  let totalChecks = 0;
  const { languageId, bibleId } = BibleHelpers.getOrigLangforBook(bookId);
  const expectedVerses = MissingVersesHelpers.getExpectedBookVerses(bookId, languageId, bibleId);

  if (expectedVerses && fs.existsSync(pathToWordAlignmentData)) {
    let groupDataFiles = fs.readdirSync(pathToWordAlignmentData).filter(file => // filter out .DS_Store
      path.extname(file) === '.json',
    );

    groupDataFiles.forEach((chapterFileName) => {
      const chapterPath = path.join(pathToWordAlignmentData, chapterFileName);

      try {
        groupsObject[path.parse(chapterFileName).name] = fs.readJsonSync(
          chapterPath);
      } catch (e) {
        console.error(`Failed to read alignment data from ${chapterPath}. This will be fixed by #4884`, e);
      }
    });

    for (let chapterNumber in groupsObject) {
      for (let verseNumber in groupsObject[chapterNumber]) {
        if (!parseInt(verseNumber)) {
          continue;
        }

        const verseDone = isVerseAligned(groupsObject[chapterNumber][verseNumber]);

        if (verseDone) {
          checked++;
        }
      }
    }
    totalChecks = Object.keys(expectedVerses).reduce((chapterTotal, chapterNumber) => Object.keys(expectedVerses[chapterNumber]).length + chapterTotal, 0);
  }

  if (totalChecks) {
    return checked / totalChecks;
  }
  return 0;
}

/**
 * checks that verse is aligned, first makes sure that word bank (containing unaligned words) is empty, then double
 *    checks that there are words in verse.  If both of these conditions are true, then we treat it as an aligned verse
 * @param {Object} verseAlignments
 * @return {boolean} true if aligned
 */
export function isVerseAligned(verseAlignments) {
  let aligned = verseAlignments && !verseAlignments.wordBank.length;

  if (aligned) { // if word bank is empty, need to make sure that the verse wasn't empty (no bottom words)
    const foundWords = verseAlignments.alignments.findIndex(alignment => alignment.bottomWords && alignment.bottomWords.length);

    if (foundWords < 0) { // if verse empty, not aligned
      aligned = false;
    }
  }
  return aligned;
}

export function getWordAlignmentProgressForGroupIndex(projectSaveLocation, bookId, groupIndex) {
  let checked = 0;
  let totalChecks = 0;
  const pathToWordAlignmentData = path.join(projectSaveLocation, '.apps', 'translationCore', 'alignmentData', bookId);

  if (!fs.existsSync(pathToWordAlignmentData)) {
    return 0;
  }

  const chapterNum = groupIndex.id.split('_')[1];
  let groupDataFileName = fs.readdirSync(pathToWordAlignmentData).find(file => // filter out .DS_Store
    //This will break if we change the wordAlignment tool naming
    //convention of chapter a like chapter_1.json...
    path.parse(file).name === chapterNum,
  );

  if (groupDataFileName) {
    const groupIndexObject = fs.readJsonSync(path.join(pathToWordAlignmentData, groupDataFileName));

    for (let verseNumber in groupIndexObject) {
      if (parseInt(verseNumber)) {
        const verseDone = isVerseAligned(groupIndexObject[verseNumber]);

        if (verseDone) {
          checked++;
        }
      }
    }

    const { languageId, bibleId } = BibleHelpers.getOrigLangforBook(bookId);
    const expectedVerses = MissingVersesHelpers.getExpectedBookVerses(bookId, languageId, bibleId);
    totalChecks = Object.keys(expectedVerses[chapterNum]).length;

    if (totalChecks) {
      return checked / totalChecks;
    }
  }
  return 0;
}

export function updateProjectFolderName(newProjectName, projectSaveLocation, oldSelectedProjectFileName) {
  const sourcePath = path.join(projectSaveLocation, oldSelectedProjectFileName);
  const destinationPath = path.join(projectSaveLocation, newProjectName);

  if (fs.existsSync(sourcePath) && !fs.existsSync(destinationPath)) {
    fs.moveSync(sourcePath, destinationPath);
  }
}

/**
 * the folder name is normally the bookId, but if there is not a valid project.id in manifest we fall back to using
 *      the project name.  This function determines if we used the default
 * @param {String} projectFilename
 * @param {String} projectPath
 * @return {String} project folder name
 */
export function getInitialBibleDataFolderName(projectFilename, projectPath) {
  const initialManifest = manifestHelpers.getProjectManifest(projectPath);
  const expectedProjectId = (initialManifest && initialManifest.project && initialManifest.project.id);

  if (expectedProjectId) { // if we have a project id, verify that this is what was actually used for bible data
    const expectedBibleDataPath = path.join(projectPath, expectedProjectId);

    if (fs.existsSync(expectedBibleDataPath)) {
      if (fs.lstatSync(expectedBibleDataPath).isDirectory()) {
        return expectedProjectId;
      }
    }
  }
  return projectFilename; // defaulted to project filename
}

/**
 * if the project.id has been changed in the manifest, we need to move the bible data to new folder
 * @param {Object} manifest
 * @param {String} initialBibleDataFolderName
 * @param {String} projectPath
 */
export function fixBibleDataFolderName(manifest, initialBibleDataFolderName, projectPath) {
  if (manifest && manifest.project && manifest.project.id && (manifest.project.id !== initialBibleDataFolderName)) { // if project.id has changed
    const initialBibleFolderPath = path.join(projectPath, initialBibleDataFolderName);
    const updatedBibleFolderPath = path.join(projectPath, manifest.project.id);

    if (fs.existsSync(initialBibleFolderPath) && ! fs.existsSync(updatedBibleFolderPath)) {
      fs.moveSync(initialBibleFolderPath, updatedBibleFolderPath);
    }
  }
}
