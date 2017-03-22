import consts from './CoreActionConsts';
import { remote } from 'electron';
import { sendPath } from '../components/core/UploadMethods.js';
import { setSettings } from './SettingsActions.js';
//const declaration
const {dialog} = remote;

module.exports.sendFilePath = function (path, link, callback = ()=>{}) {
    return ((dispatch) => {
        dispatch({
            type: consts.DRAG_DROP_SENDPATH,
            filePath: path,
        });
        sendPath(path, link, ()=>{
            dispatch(setSettings('showTutorial', false));
            if(callback) callback();
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
