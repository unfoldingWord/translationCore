import consts from './CoreActionConsts';
import { remote } from 'electron';
import { setSettings } from './SettingsActions.js';
//const declaration
const {dialog} = remote;
import * as toolsActions from './ToolsActions.js';
import * as SettingsActions from './SettingsActions.js';
import * as GetDataActions from './GetDataActions.js';
import * as RecentProjectsActions from './RecentProjectsActions.js';

export function sendFilePath (path, link, callback = ()=>{}) {
    return ((dispatch) => {
        dispatch({
            type: consts.DRAG_DROP_SENDPATH,
            filePath: path,
        });
        dispatch(GetDataActions.openProject(path, link, ()=>{
            dispatch(SettingsActions.setSettings('showTutorial', false));
            dispatch(RecentProjectsActions.startLoadingNewProject());
            if(callback) callback();
        }));
    })
}

export function onClick (dialogOpen, properties) {
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
