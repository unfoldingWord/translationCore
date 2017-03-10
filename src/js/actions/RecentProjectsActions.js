const consts = require('./CoreActionConsts');
const api = window.ModuleApi;
const sync = require('../components/core/SideBar/GitSync.js');
const fs = require(window.__base + 'node_modules/fs-extra');
const path = require('path-extra');
const DEFAULT_SAVE = path.join(path.homedir(), 'translationCore');
const Upload = require('../components/core/UploadMethods.js');
const modalActions = require('./ModalActions');
const toolsActions = require('./ToolsActions');
import { showNotification } from './NotificationActions'

module.exports.onLoad = function (filePath) {
    return ((dispatch) => {
        const _this = this;
        Upload.sendFilePath(filePath, undefined, (err) => {
            if (!err) {
                dispatch(_this.startLoadingNewProject());
            }
        });
    })
}

module.exports.syncProject = function (projectPath) {
    sync(projectPath);
    return {
        type: consts.SYNC_PROJECT,
    }
}

module.exports.getProjectsFromFolder = function () {
    const recentProjects = fs.readdirSync(DEFAULT_SAVE);
    return {
        type: consts.GET_RECENT_PROJECTS,
        recentProjects: recentProjects
    }
}

module.exports.startLoadingNewProject = function (lastCheckModule) {
    return ((dispatch, getState) => {
        if (Upload.checkIfValidBetaProject(api.getDataFromCommon('tcManifest')) || getState().settingsReducer.currentSettings.developerMode) {
            api.emitEvent('changeCheckType', { currentCheckNamespace: null });
            api.emitEvent('newToolSelected', { 'newToolSelected': true });
            if (!lastCheckModule) dispatch(showNotification('Info: Your project is ready to be loaded once you select a tool', 5));
            dispatch({ type: consts.SHOW_APPS, val: true });
            dispatch(toolsActions.getToolsMetadatas());
            dispatch(modalActions.selectModalTab(3, 1, true));
            if (lastCheckModule) dispatch(toolsActions.loadTool(lastCheckModule));
        } else {
            dispatch(showNotification('You can only load Ephisians or Titus projects for now.', 5));
            dispatch(this.getProjectsFromFolder());
            dispatch({type:"DRAG_DROP_SENDPATH", filePath:''})
            dispatch({type:"LOAD_TOOL"})
            Upload.clearPreviousData()
        }
    })
}