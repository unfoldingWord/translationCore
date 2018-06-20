import React from 'react';
import path from 'path-extra';
import fs from 'fs-extra';
import {getTranslate, getUsername} from '../selectors';
import * as ProjectMergeHelpers from '../helpers/ProjectMergeHelpers';
import * as AlertModalActions from './AlertModalActions';

export const handleProjectMerge = (oldProjectPath, newProjectPath) => {
  return (dispatch, getState) => {
    return new Promise(async (resolve, reject) => {
      const projectName = path.basename(newProjectPath);
      const translate = getTranslate(getState());
      const confirmText = translate('buttons.overwrite_project');
      const cancelText = translate('buttons.cancel_button');
      let reimportMessage = translate('projects.project_reimport_usfm3_message');
      if (! fs.existsSync(path.join(newProjectPath, '.apps'))) {
        reimportMessage = (
          <div>
            <p>{translate('projects.project_already_exists', {'project_name': projectName})}</p>
            <p>{translate('projects.project_reimport_usfm2_message', {over_write: confirmText})}</p>
          </div>
        );
      }
      await dispatch(AlertModalActions.openOptionDialog(reimportMessage,
        (result) => {
          dispatch(AlertModalActions.closeAlertDialog());
          if (result === confirmText) {
            try {
              ProjectMergeHelpers.handleProjectMerge(oldProjectPath, newProjectPath, getUsername(getState()), translate);
              resolve();
            } catch(error) {
              console.log(error);
              const errorMessage = translate('projects.project_merge_error', {project_name: projectName});
              reject(errorMessage);
            }
          } else {
            reject();
          }
        },
        confirmText,
        cancelText
      ));
    });
  };
};
