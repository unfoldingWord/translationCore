// helpers
import * as ProjectImportFilesystemHelpers from '../src/js/helpers/Import/ProjectImportFilesystemHelpers';

describe('Test ProjectImportFilesystemHelpers',()=>{
  const projectName = 'aa_tit_text_ulb';
  test('ProjectImportFilesystemHelpers.move works', () => {
    ProjectImportFilesystemHelpers.move(projectName);
  });
});
