/**
 * @description Initiates the loading of a usfm file into current project, puts the target language, params,
 * save location, and manifest into the store.
 *
 * @param {string} projectPath - Path in which the USFM project is being loaded from
 * @param {string} direction - Direction of the book being read for the project target language
 * @param {string} projectLink - Link given to load project if taken from online
 */
export function openUSFMProject(usfmFilePath, projectPath, direction, projectLink, currentUser, exporting) {
  return ((dispatch) => {
    const projectSaveLocation = LoadHelpers.correctSaveLocation(projectPath);
    dispatch(projectDetailsActions.setSaveLocation(projectSaveLocation));
    const usfmData = LoadHelpers.setUpUSFMProject(usfmFilePath, projectSaveLocation);
    const parsedUSFM = LoadHelpers.getParsedUSFM(usfmData);
    const targetLanguage = LoadHelpers.formatTargetLanguage(parsedUSFM);
    dispatch(ResourcesActions.addNewBible('targetLanguage', targetLanguage));
    dispatch(setUSFMParams(parsedUSFM.book, projectSaveLocation, direction));
    let manifest = LoadHelpers.loadFile(projectSaveLocation, 'manifest.json');
    if (!manifest) {
      const defaultManifest = LoadHelpers.setUpDefaultUSFMManifest(parsedUSFM, direction, currentUser);
      manifest = LoadHelpers.saveManifest(projectSaveLocation, projectLink, defaultManifest);
    }
    dispatch(addLoadedProjectToStore(projectSaveLocation, manifest));
    if (!exporting) dispatch(displayToolsToLoad(manifest));
  });
}

 /**
 * @description Set ups a tC project parameters for a usfm project
 * @param {string} bookAbbr - Book abbreviation
 * @param {path} projectSaveLocation - Path of the usfm project being loaded
 * @param {path} direction - Reading direction of the project books
 * @return {object} action object.
 */
export function setUSFMParams(bookAbbr, projectSaveLocation, direction) {
  return ((dispatch) => {
    let params = {
      originalLanguagePath: ORIGINAL_LANGUAGE_PATH,
      targetLanguagePath: projectSaveLocation,
      direction: direction,
      bookAbbr: bookAbbr
    };
    if (LoadHelpers.isOldTestament(bookAbbr)) {
      params.originalLanguage = "hebrew";
    } else {
      params.originalLanguage = "greek";
    }
    dispatch(projectDetailsActions.setProjectParams(params));
  });
}