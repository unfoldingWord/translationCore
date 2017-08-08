import * as fs from 'fs-extra';
import Path from 'path-extra';
import consts from './ActionTypes';
const DEFAULT_SAVE = Path.join(Path.homedir(), 'translationCore', 'projects');
/**
 *  Reads projects from the fs in ~/translationCore/
 */
export function getProjectsFromFolder() {
  const recentProjects = fs.readdirSync(DEFAULT_SAVE);
  return {
    type: consts.GET_RECENT_PROJECTS,
    recentProjects: recentProjects
  }
}
