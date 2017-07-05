import { remote } from 'electron';

const { dialog } = remote;

export function selectLocalProjectToLoad() {
  return ((dispatch, getState)=> {
    dialog.showOpenDialog((filePaths) => {
      console.log(filePaths);
    });
  });
}