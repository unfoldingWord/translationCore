import React from 'react';
import path from 'path-extra';
import fs from 'fs-extra';
import { remote } from 'electron';
// actions
import * as AlertModalActions from './AlertModalActions';
import * as BodyUIActions from './BodyUIActions';
// contstants
const { dialog } = remote;

export function selectLocalProjectToLoad() {
  return ((dispatch, getState)=> {
    const alertMessage = (
      <div>
        No file was selected. Please click on the
        <span style={{ color: 'var(--accent-color-dark)', fontWeight: "bold"}}>
          &nbsp;Import Local Project&nbsp;
        </span>
        button again and select the project you want to load.
      </div>
    );

    dialog.showOpenDialog((filePath) => {
      if(filePath === undefined){
        dispatch(BodyUIActions.toggleProjectsFAB());
        dispatch(AlertModalActions.openAlertDialog(alertMessage));
      } else if(verifyIsValidProject(filePath[0])) {
        console.log(filePath);
      } else {
        console.log(filePath);
      }
    });
  });
}


function verifyIsValidProject(projectPath) {
  const projectManifestPath = path.join(projectPath, "manifest.json");
  if (fs.existSync(projectManifestPath)) {
    return true;
  }
  return false;
}
