import consts from './CoreActionConsts';
import sync from '../components/core/SideBar/GitSync.js';
import fs from 'fs-extra';
import path from 'path-extra';
// actions
import * as getDataActions from './GetDataActions';
// contant declarations
const DEFAULT_SAVE = path.join(path.homedir(), 'translationCore');

export function onLoad(filePath) {
  return ((dispatch) => {
    dispatch(getDataActions.openProject(filePath));
  })
}

export function syncProject(projectPath) {
  sync(projectPath, manifest);
  return {
    type: consts.SYNC_PROJECT
  }
}

export function getProjectsFromFolder() {
  const recentProjects = fs.readdirSync(DEFAULT_SAVE);
  return {
    type: consts.GET_RECENT_PROJECTS,
    recentProjects: recentProjects
  }
}
