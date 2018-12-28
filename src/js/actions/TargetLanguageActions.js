import fs from "fs-extra";
import path from "path-extra";
// actions
import * as ResourcesActions from "./ResourcesActions";

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
      const files = fs.readdirSync(targetBiblePath);

      for (let i = 0, len = files.length; i < len; i++) {
        const file = files[i];
        const chapterNumber = path.basename(file, ".json");
        if (!isNaN(chapterNumber)) {
          // load chapter
          bibleData[chapterNumber] = fs.readJsonSync(
            path.join(targetBiblePath, file));

        } else if (file === "manifest.json") {
          // load manifest
          bibleData["manifest"] = fs.readJsonSync(
            path.join(targetBiblePath, file));
        }
      }

      dispatch(ResourcesActions.addNewBible(resourceId, bibleId, bibleData));
    } else {
      console.warn("Target Bible was not found in the project root folder");
    }
  };
}

