import fs from 'fs-extra';
import path from 'path-extra';
import env from 'tc-electron-env';
import consts from './ActionTypes';
// constants
const DEFAULT_SAVE = path.join(env.home(), 'translationCore', 'projects');

/**
 * Reads projects from the fs in ~/translationCore/
 */
export function getProjectsFromFolder() {
  const recentProjects = fs.readdirSync(DEFAULT_SAVE);
  return {
    type: consts.GET_RECENT_PROJECTS,
    recentProjects: recentProjects,
  };
}
