const consts = require('./CoreActionConsts');
const api = window.ModuleApi;
import sync from '../components/core/SideBar/GitSync.js';
import * as fs from 'fs-extra';
import path from 'path-extra';
const DEFAULT_SAVE = path.join(path.homedir(), 'translationCore');
import * as modalActions from './ModalActions';
import * as toolsActions from './ToolsActions';
import * as getDataActions from './GetDataActions';
import * as NotificationActions from './NotificationActions';

export function onLoad (filePath) {
    return ((dispatch) => {
        dispatch(getDataActions.openProject(filePath));
    })
}

export function syncProject (projectPath) {
    sync(projectPath, manifest);
    return {
        type: consts.SYNC_PROJECT,
    }
}

export function getProjectsFromFolder () {
    const recentProjects = fs.readdirSync(DEFAULT_SAVE);
    return {
        type: consts.GET_RECENT_PROJECTS,
        recentProjects: recentProjects
    }
}
