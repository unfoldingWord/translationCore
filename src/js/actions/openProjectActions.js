import path from 'path-extra';
// actions
import consts from './ActionTypes';
import * as AlertModalActions from './AlertModalActions';
import * as ModalActions from './ModalActions';
import * as ToolsActions from './ToolsActions';
import * as LoadHelpers from '../helpers/LoadHelpers';
import * as RecentProjectsActions from './RecentProjectsActions';
import * as CurrentToolActions from './currentToolActions';
import * as BodyUIActions from './BodyUIActions';
import * as projectDetailsActions from './projectDetailsActions';


export function openProject(projectPath, projectLink) {
    return ((dispatch, getState) => {
        const { username } = getState().loginReducer.userdata;
        if (!isValidProject(projectPath, projectLink, username)) return;
        else {
            clearLastProject();
            loadProjectIntoApp();
            displayTools();
        }
    });
}

export function isValidProject(projectPath, projectLink, username) {
    if (!projectPath) {
        return false;
    } else if (LoadHelpers.isUSFMProject(projectPath)) {
        return false;
    } else {
        let manifest = getProjectManifest(projectPath, projectLink, username);
        if (!manifest) return false;
        if (LoadHelpers.projectHasMergeConfilcts(manifest.finished_chunks, projectPath)) return false;
        if (LoadHelpers.projectIsMissingVerses(manifest.project.name, projectPath)) return false;
    }
    return true;
}

export function getProjectManifest(projectPath, projectLink, username) {
    let manifest = LoadHelpers.loadFile(projectPath, 'manifest.json');
    let tCManifest = LoadHelpers.loadFile(projectPath, 'tc-manifest.json');
    manifest = manifest || tCManifest;
    if (!manifest || !manifest.tcInitialized) {
        manifest = LoadHelpers.setUpManifest(projectPath, projectLink, manifest, username);
    }
    return manifest;
}

export function clearLastProject() {
    return ((dispatch) => {
        dispatch({ type: consts.CLEAR_PREVIOUS_GROUPS_DATA });
        dispatch({ type: consts.CLEAR_PREVIOUS_GROUPS_INDEX });
        dispatch({ type: consts.CLEAR_CONTEXT_ID });
        dispatch({ type: consts.CLEAR_CURRENT_TOOL });
        dispatch({ type: consts.CLEAR_PREVIOUS_DATA });
        dispatch({ type: consts.CLEAR_RESOURCES_REDUCER });
        dispatch(projectDetailsActions.resetProjectDetail());
        dispatch(CurrentToolActions.setToolTitle(""));
        dispatch(BodyUIActions.toggleHomeView(true));
        dispatch(saveModuleFetchData(null));
    });
}

export function loadProjectIntoApp(projectPath, manifest) {
    return ((dispatch) => {
        projectPath = LoadHelpers.saveProjectInHomeFolder(projectPath);
        dispatch(projectDetailsActions.setSaveLocation(projectPath));
        dispatch(projectDetailsActions.setProjectManifest(manifest));
        dispatch(projectDetailsActions.setProjectDetail("bookName", manifest.project.name));
        const params = LoadHelpers.getParams(projectPath, manifest);
        dispatch(projectDetailsActions.setProjectParams(params));
    });
}

export function displayTools() {
    return ((dispatch, getState) => {
        const { currentSettings } = getState().settingsReducer;
        if (LoadHelpers.checkIfValidBetaProject(manifest) || currentSettings.developerMode) {
            dispatch(ToolsActions.getToolsMetadatas());
            dispatch(ModalActions.selectModalTab(3, 1, true));
        } else {
            dispatch(AlertModalActions.openAlertDialog('You can only load Ephesians or Titus projects for now.', false));
            dispatch(RecentProjectsActions.getProjectsFromFolder());
            dispatch(clearLastProject())
        }
    });
}