import fs from 'fs-extra';
import path from 'path-extra';
import ospath from 'ospath';
// actions
import * as AlertModalActions from "../actions/AlertModalActions";
import * as OnlineModeConfirmActions from "../actions/OnlineModeConfirmActions";
import * as ProjectInformationCheckActions from "../actions/ProjectInformationCheckActions";
import * as HomeScreenActions from "../actions/HomeScreenActions";
// helpers
import {getProjectManifest, getTranslate} from "../selectors";
import * as MissingVersesHelpers from './ProjectValidation/MissingVersesHelpers';
import * as GogsApiHelpers from "./GogsApiHelpers";
import BooksOfTheBible from "../common/BooksOfTheBible";

const PROJECTS_PATH = path.join(ospath.home(), 'translationCore', 'projects');

/**
 * display prompt that project as been renamed
 * @return {Promise} - Returns a promise
 */
export function showRenamedDialog() {
  return ((dispatch, getState) => {
    const { projectDetailsReducer: { projectSaveLocation }} = getState();
    return new Promise(async (resolve) => {
      const translate = getTranslate(getState());
      const projectName = path.basename(projectSaveLocation);
      dispatch(AlertModalActions.openOptionDialog(
        translate('projects.renamed_project', {project: projectName}),
        () => {
          dispatch(AlertModalActions.closeAlertDialog());
          resolve();
        },
        translate('buttons.ok_button')
      ));
    });
  });
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
  return { repoNeedsRenaming, newRepoExists, newProjectName };
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
 * show user that DCS rename failed, give options
 * @param {String} projectSaveLocation
 * @param {Boolean} createNew - flag that we were doing a create new repo on DCS vs. a rename of the reo
 * @return {Function}
 */
export function showDcsRenameFailure(projectSaveLocation, createNew) {
  return ((dispatch, getState) => {
    const translate = getTranslate(getState());
    const retryText = translate('buttons.retry');
    const continueText = translate('buttons.continue_button');
    const contactHelpDeskText = translate('buttons.contact_helpdesk');
    const projectName = path.basename(projectSaveLocation);
    dispatch(
      AlertModalActions.openOptionDialog(translate('projects.dcs_rename_failed', {project:projectName}),
        (result) => {
          dispatch(AlertModalActions.closeAlertDialog());
          switch (result) {
            case retryText:
              dispatch(handleDcsOperation(createNew, projectSaveLocation)); // retry operation
              break;

            case contactHelpDeskText:
              dispatch(showFeedbackDialog(createNew ? "_.support_dcs_create_new_failed" : "_.support_dcs_rename_failed", () => {
                dispatch(showDcsRenameFailure(projectSaveLocation, createNew)); // reshow alert dialog
              }));
              break;

            default:
              break;
          }
        }, retryText, continueText, contactHelpDeskText));
  });
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
    const {userdata} = state.loginReducer;
    const { projectSaveLocation } = state.projectDetailsReducer;
    const projectInfo = await GogsApiHelpers.getProjectInfo(projectSaveLocation, userdata);
    return translate(translateKey, projectInfo);
  });
}

/**
 * display the feedback dialog
 * @param {string} translateKey - key of string to use for help desk
 * @param {function} doneCB - callback when feedback dialog closes
 * @return {Function}
 */
export function showFeedbackDialog(translateKey, doneCB = null) {
  return (async (dispatch) => {
    const message = await dispatch(getFeedbackDetailsForHelpDesk(translateKey));
    dispatch(HomeScreenActions.setErrorFeedbackMessage(message)); // put up feedback dialog
    dispatch(HomeScreenActions.setFeedbackCloseCallback(doneCB));
  });
}

/**
 * handles the renaming on DCS
 * @return {Promise} - Returns a promise
 */
export function doDcsRenamePrompting() {
  return ((dispatch, getState) => {
    const { projectSaveLocation } = getState().projectDetailsReducer;
    return new Promise((resolve) => {
      const translate = getTranslate(getState());
      const renameText = translate('buttons.rename_repo');
      const createNewText = translate('buttons.create_new_repo');
      const projectName = path.basename(projectSaveLocation);
      dispatch(
        AlertModalActions.openOptionDialog(translate('projects.dcs_rename_project', {project:projectName}),
          (result) => {
            const createNew = (result === createNewText);
            dispatch(AlertModalActions.closeAlertDialog());
            const {userdata} = getState().loginReducer;
            GogsApiHelpers.changeGitToPointToNewRepo(projectSaveLocation, userdata).then(async () => {
              await dispatch(handleDcsOperation(createNew, projectSaveLocation));
              resolve();
            }).catch((e) => {
              console.log(e);
              resolve();
            });
          },
          renameText,
          createNewText
        )
      );
    });
  });
}

/**
 * perform selected action create new or rename project on DCS to match new name
 * @param {boolean} createNew - if true then create new DCS project with current name
 * @param {string} projectSaveLocation
 * @return {Promise<Function>}
 */
export function handleDcsOperation(createNew, projectSaveLocation) {
  return ((dispatch, getState) => {
    return new Promise((resolve) => {
      dispatch(OnlineModeConfirmActions.confirmOnlineAction(
        async () => { // on confirmed
          const {userdata} = getState().loginReducer;
          const projectName = path.basename(projectSaveLocation);
          doesDcsProjectNameAlreadyExist(projectName, userdata).then(async (repoExists) => {
            if (repoExists) {
              dispatch(handleDcsRenameCollision());
            } else {
              if (createNew) {
                try {
                  await GogsApiHelpers.createNewRepo(projectName, projectSaveLocation, userdata);
                } catch (e) {
                  dispatch(showDcsRenameFailure(projectSaveLocation, createNew));
                  console.warn(e);
                }
              } else { // if rename
                try {
                  await GogsApiHelpers.renameRepo(projectName, projectSaveLocation, userdata);
                } catch (e) {
                  dispatch(showDcsRenameFailure(projectSaveLocation, createNew));
                  console.warn(e);
                }
              }
            }
            resolve();
          }).catch((e) => {
            dispatch(showDcsRenameFailure(projectSaveLocation, createNew));
            console.log("exists failure");
            console.log(e);
            resolve();
          });
        },
        () => {
          console.log("cancelled");
          resolve();
        } // on cancel
      ));
    });
  });
}

/**
 * handles the prompting for overwrite/merge of project
 * @return {Promise} - Returns a promise
 */
export function handleDcsRenameCollision() {
  return ((dispatch, getState) => {
    const { projectSaveLocation } = getState().projectDetailsReducer;
    return new Promise((resolve) => {
      const translate = getTranslate(getState());
      const renameText = translate('buttons.rename_local');
      const continueText = translate('buttons.do_not_rename');
      const contactHelpDeskText = translate('buttons.contact_helpdesk');
      const projectName = path.basename(projectSaveLocation);
      dispatch(
        AlertModalActions.openOptionDialog(translate('projects.dcs_rename_conflict', {project:projectName}),
          (result) => {
            dispatch(AlertModalActions.closeAlertDialog());
            switch (result) {
              case renameText:
                dispatch(ProjectInformationCheckActions.openOnlyProjectDetailsScreen(projectSaveLocation));
                break;

              case contactHelpDeskText:
                dispatch(showFeedbackDialog("_.support_dcs_rename_conflict", () => {
                  dispatch(handleDcsRenameCollision()); // reshow alert dialog
                }));
                break;

              default:
                break;
            }
            resolve();
          },
          renameText,
          continueText,
          contactHelpDeskText
        )
      );
    });
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
export function getDetailsFromProjectName(projectName) {
  let bookId = "";
  let bookName = "";
  let languageId = "";
  if (projectName) {
    const parts = projectName.split("_");
    languageId = parts[0];
    // we can have a bunch of old formats (e.g. en_act, aaw_php_text_reg) and new format (en_ult_tit_book)
    for (let i = 1; i < parts.length; i++) { // iteratively try the fields to see if valid book ids
      const possibleBookId = parts[i].toLowerCase();
      bookName = BooksOfTheBible.newTestament[possibleBookId];
      if (bookName) {
        bookId = possibleBookId; // if valid bookName use this book id
        break;
      }
    }
  }
  return { bookId, languageId, bookName};
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
  const resourceType = "book"; //TODO blm:  hard coded for now
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
  return {hoverProjectName, displayedProjectLabel};
}

/**
 * Gets a tool's progress
 * @param {String} pathToCheckDataFiles
 */
export function getToolProgress(pathToCheckDataFiles) {
  let progress = 0;
  if (fs.existsSync(pathToCheckDataFiles)) {
    let groupDataFiles = fs.readdirSync(pathToCheckDataFiles).filter(file => { // filter out .DS_Store
      return file !== '.DS_Store' && path.extname(file) === '.json';
    });
    let allGroupDataObjects = {};
    groupDataFiles.map((groupDataFileName) => {
      const groupData = fs.readJsonSync(path.join(pathToCheckDataFiles, groupDataFileName));
      allGroupDataObjects[groupDataFileName.replace('.json', '')] = groupData;
    });
    progress = calculateProgress(allGroupDataObjects);
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
      completedChecks += (check.selections) ? 1 : 0;
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
  const expectedVerses = MissingVersesHelpers.getExpectedBookVerses(bookId, 'grc', 'ugnt');
  if (fs.existsSync(pathToWordAlignmentData)) {
    let groupDataFiles = fs.readdirSync(pathToWordAlignmentData).filter(file => { // filter out .DS_Store
      return path.extname(file) === '.json';
    });
    groupDataFiles.forEach((chapterFileName) => {
      groupsObject[path.parse(chapterFileName).name] = fs.readJsonSync(path.join(pathToWordAlignmentData, chapterFileName));
    });
    for (let chapterNumber in groupsObject) {
      for (let verseNumber in groupsObject[chapterNumber]) {
        if (!parseInt(verseNumber)) continue;
        const verseDone = isVerseAligned(groupsObject[chapterNumber][verseNumber]);
        if (verseDone) {
          checked++;
        }
      }
    }
    totalChecks = Object.keys(expectedVerses).reduce((chapterTotal, chapterNumber) => {
      return Object.keys(expectedVerses[chapterNumber]).length + chapterTotal;
    }, 0);
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
    const foundWords = verseAlignments.alignments.findIndex(alignment => {
      return alignment.bottomWords && alignment.bottomWords.length;
    });
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
  if(!fs.existsSync(pathToWordAlignmentData)) {
    return 0;
  }
  const chapterNum = groupIndex.id.split('_')[1];
  let groupDataFileName = fs.readdirSync(pathToWordAlignmentData).find(file => { // filter out .DS_Store
    //This will break if we change the wordAlignment tool naming
    //convention of chapter a like chapter_1.json...
    return path.parse(file).name === chapterNum;
  });
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
    const expectedVerses = MissingVersesHelpers.getExpectedBookVerses(bookId, 'grc', 'ugnt');
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
  if (fs.existsSync(sourcePath) && !fs.existsSync(destinationPath))
    fs.moveSync(sourcePath, destinationPath);
}

/**
 * the folder name is normally the bookId, but if there is not a valid project.id in manifest we fall back to using
 *      the project name
 * @param {Object} state
 * @param {String} projectFilename
 * @return {String} project folder name
 */
export function getInitialBibleDataFolderName(state, projectFilename) {
  const initialManifest = getProjectManifest(state);
  return (initialManifest && initialManifest.project && initialManifest.project.id) || projectFilename;
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
    if(fs.existsSync(initialBibleFolderPath) && ! fs.existsSync(updatedBibleFolderPath)) {
      fs.moveSync(initialBibleFolderPath, updatedBibleFolderPath);
    }
  }
}

