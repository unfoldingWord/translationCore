/**
 * @Description:
 * Import Helpers for moving projects to `~/translationCore/imports` while importing
 * and to `~/translationCore/projects` after migrations and validation.
 * Other import based fs functions should reside here if possible for maintainability
 * and to make fs mocks simpler.
 */
// Bruce Anchor
jest.unmock('fs-extra');
import fs from 'fs-extra';

export const move = (fromPath, toPath) => {
  // if project does not exist then move import to projects
    if(fs.existsSync(toPath)) {
        console.warn('Project: ', toPath, ' already exists. Cannot copy.');
    } else {
      // copy import to project
        if( fs.existsSync(fromPath)) {
          fs.copySync(fromPath, toPath);
          // verify target project copied
            if(fs.existsSync(toPath)) {
              // remove from imports
                fs.removeSync(fromPath);
            } else {
               console.warn('Could not copy: ', fromPath, ' to: ', toPath);
            }
        } else {
            console.warn('No import project: ', fromPath);
        }
    }
};
