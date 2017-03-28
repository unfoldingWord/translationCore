import consts from './CoreActionConsts';
import fs from 'fs-extra';
import sync from '../components/core/SideBar/GitSync.js';
import path from 'path-extra';
import {sendPath, checkIfValidBetaProject, clearPreviousData} from '../components/core/UploadMethods.js';
import {showNotification} from './NotificationActions';
import modalActions from './ModalActions';
import toolsActions from './ToolsActions';
const DEFAULT_SAVE = path.join(path.homedir(), 'translationCore');
const api = window.ModuleApi;

module.exports.onLoad = function(filePath) {
  return ((dispatch) => {
    const _this = this;
    sendPath(filePath, undefined, (err) => {
      if (!err) {
        dispatch(_this.startLoadingNewProject());
      }
    });
  });
};

module.exports.syncProject = function(projectPath) {
  sync(projectPath);
  return {
    type: consts.SYNC_PROJECT
  };
};

module.exports.getProjectsFromFolder = function() {
  const recentProjects = fs.readdirSync(DEFAULT_SAVE);
  return {
    type: consts.GET_RECENT_PROJECTS,
    recentProjects: recentProjects
  };
};

module.exports.startLoadingNewProject = function(lastCheckModule) {
  return ((dispatch, getState) => {
    const currentState = getState();
    if (checkIfValidBetaProject(api.getDataFromCommon('tcManifest')) || (currentState.settingsReducer.currentSettings && currentState.settingsReducer.currentSettings.developerMode)) {
      api.emitEvent('changeCheckType', {currentCheckNamespace: null});
      api.emitEvent('newToolSelected', {newToolSelected: true});
      if (!lastCheckModule) dispatch(showNotification('Info: Your project is ready to be loaded once you select a tool', 5));
      dispatch({type: consts.SHOW_APPS, val: true});
      dispatch(toolsActions.getToolsMetadatas());
      dispatch(modalActions.selectModalTab(3, 1, true));
      if (lastCheckModule) dispatch(toolsActions.loadTool(lastCheckModule));
    } else {
      dispatch(showNotification('You can only load Ephisians or Titus projects for now.', 5));
      dispatch(this.getProjectsFromFolder());
      dispatch({type: "DRAG_DROP_SENDPATH", filePath: ''});
      dispatch({type: "LOAD_TOOL"});
      clearPreviousData();
    }
  });
};
