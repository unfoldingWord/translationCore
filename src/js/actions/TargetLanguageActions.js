import fs from "fs-extra";
import path from "path-extra";
// actions
import * as ResourcesActions from "./ResourcesActions";

/**
 * @description Loads a target language bible chapter from file system.
 * @param {String} chapterNumber - chapter number to be loaded to resources reducer.
 */
export function loadTargetLanguageChapter (chapterNumber) {
  return ((dispatch, getState) => {
    const { projectDetailsReducer } = getState();
    const bookAbbreviation = projectDetailsReducer.manifest.project.id;
    const projectPath = projectDetailsReducer.projectSaveLocation;
    const targetBiblePath = path.join(projectPath, bookAbbreviation);
    const resourceId = "targetLanguage";
    const bibleId = "targetBible";
    let targetLanguageChapter;
    const fileName = chapterNumber + ".json";
    if (fs.existsSync(path.join(targetBiblePath, fileName))) {
      targetLanguageChapter = fs.readJsonSync(
        path.join(targetBiblePath, fileName));
    } else {
      console.log("Target Bible was not found in the project root folder");
      return;
    }
    let bibleData = {};
    bibleData[chapterNumber] = targetLanguageChapter;
    if (fs.existsSync(path.join(targetBiblePath, "manifest.json"))) {
      bibleData["manifest"] = fs.readJsonSync(
        path.join(targetBiblePath, "manifest.json"));
      dispatch(ResourcesActions.addNewBible(resourceId, bibleId, bibleData));
    }
  });
}

export function loadTargetLanguageBible () {
  return (dispatch, getState) => {
    const { projectDetailsReducer } = getState();
    const bookAbbreviation = projectDetailsReducer.manifest.project.id;
    const projectPath = projectDetailsReducer.projectSaveLocation;
    const targetBiblePath = path.join(projectPath, bookAbbreviation);
    const resourceId = "targetLanguage";
    const bibleId = "targetBible";

    if (fs.existsSync(targetBiblePath)) {
      const bibleData = {};
      fs.readdirSync(targetBiblePath).forEach(file => {
        const chapterNumber = path.basename(file, ".json");
        if (!isNaN(chapterNumber)) {
          // load chapter
          bibleData[chapterNumber] = fs.readJsonSync(
            path.join(targetBiblePath, file));

        } else if (file === "manifest.json") {
          // load manifest
          bibleData["manifest"] = fs.readJsonSync(
            path.join(targetBiblePath, file));
        } else {
          console.error("Unexpected file in target bible", file);
        }
      });
      dispatch(ResourcesActions.addNewBible(resourceId, bibleId, bibleData));
    } else {
      console.warn("Target Bible was not found in the project root folder");
    }
  };
}

