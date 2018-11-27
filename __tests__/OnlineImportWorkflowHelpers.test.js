import fs from 'fs-extra';
import path from 'path-extra';
import ospath from 'ospath';
// helpers
import * as OnlineImportWorkflowHelpers from '../src/js/helpers/Import/OnlineImportWorkflowHelpers';
// constants
const STANDARD_PROJECT = 'https://git.door43.org/royalsix/es-419_tit_text_ulb.git';
const PROJECT_NAME = 'es-419_tit_text_ulb';
const IMPORTS_PATH = path.join(ospath.home(), 'translationCore', 'imports');

describe('OnlineImportWorkflowHelpers.clone', () => {
  it('should clone a repo to the projects folder in the FS', () => {
    let pathToProject = path.join(IMPORTS_PATH, PROJECT_NAME);
    OnlineImportWorkflowHelpers.clone(STANDARD_PROJECT).then(()=>{
      let projectExists = fs.existsSync(pathToProject);
      expect(projectExists).toBeTruthy();
    });
  });
});
