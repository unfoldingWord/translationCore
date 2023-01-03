import path from 'path-extra';
import fs from 'fs-extra';

export function migrateAppsToDotApps(projectPath) {
  let projectDir = fs.readdirSync(projectPath);

  if (projectDir.includes('apps') && projectDir.includes('.apps')) {
    fs.removeSync(path.join(projectPath, '.apps'));
  }

  if (projectDir.includes('apps')) {
    fs.renameSync(path.join(projectPath, 'apps'), path.join(projectPath, '.apps'));
  }
}
