import * as ProjectImportFilesystemHelpers from '../src/js/helpers/Import/ProjectImportFilesystemHelpers';
// Tests for ProjectFAB React Component

describe('Test ProjectImportFilesystemHelpers',()=>{
  const projectName = 'aa_tit_text_ulb';
  const basePath = 'c:/Users/Owner/translationCore/';
  const fromPath = basePath + 'imports/'+ projectName;
  const toPath   = basePath + 'projects/' + projectName;
  test('ProjectImportFilesystemHelpers.move works', () => {
    ProjectImportFilesystemHelpers.move(fromPath, toPath);
  });
});