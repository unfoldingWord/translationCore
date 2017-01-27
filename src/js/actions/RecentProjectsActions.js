const consts = require('./CoreActionConsts');
const api = window.ModuleApi;
const sync = require('../components/core/SideBar/GitSync.js');
const fs = require(window.__base + 'node_modules/fs-extra');
const path = require('path-extra');
const DEFAULT_SAVE = path.join(path.homedir(), 'translationCore');
const Upload = require('../components/core/UploadMethods.js');
const modalActions = require('./ModalActions');
const toolsActions = require('./toolsActions');


module.exports.onLoad = function (filePath) {
    return ((dispatch) => {
        const _this = this;
        Upload.sendFilePath(filePath, undefined, (err) => {
            if (!err) {
                api.putDataInCommon('saveLocation', filePath);
                dispatch(_this.startLoadingNewProject());
                dispatch(toolsActions.getToolsMetadatas());
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

module.exports.startLoadingNewProject = function () {
    return ((dispatch) => {
        api.emitEvent('changeCheckType', { currentCheckNamespace: null });
        api.emitEvent('newToolSelected', { 'newToolSelected': true });
        api.Toast.info('Info:', 'Your project is ready to be loaded once you select a tool', 5);
        dispatch({ type: consts.SHOW_APPS, val: true });
        dispatch(modalActions.showModalContainer(true));
        dispatch(modalActions.selectModalTab(3))
    })
}