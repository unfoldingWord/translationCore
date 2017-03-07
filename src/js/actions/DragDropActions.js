const api = window.ModuleApi;
const consts = require('./CoreActionConsts');
const remote = require('electron').remote;
const {dialog} = remote;
const Upload = require('../components/core/UploadMethods.js');
const toolsActions = require('./ToolsActions.js');
const SettingsActions = require('./SettingsActions.js');

module.exports.sendFilePath = function (path, link, callback = ()=>{}) {
    return ((dispatch) => {
        dispatch({
            type: consts.DRAG_DROP_SENDPATH,
            filePath: path,
        });
        Upload.sendFilePath(path, link, ()=>{
            dispatch(SettingsActions.setSettings('showTutorial', false));
            callback();
        });
    })
}

module.exports.onClick = function (dialogOpen, properties) {
    return ((dispatch) => {
        const _this = this;
        if (!dialogOpen) {
            dispatch({ type: consts.DRAG_DROP_OPENDIALOG, dialogOpen: true })
            dialog.showOpenDialog({
                properties: properties
            }, (filename) => {
                if (filename !== undefined) {
                    dispatch(_this.sendFilePath(filename[0]));
                    dispatch({type: consts.VALID_OPENED_PROJECT});
                }
                dispatch({ type: consts.DRAG_DROP_OPENDIALOG, dialogOpen: false })
            });
        }
    })
}