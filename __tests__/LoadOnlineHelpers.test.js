/* eslint-env jest */
import path from 'path-extra';
import fs from 'fs-extra';
import ospath from 'ospath';
import {generateImportPath} from "../src/js/helpers/Import/OnlineImportWorkflowHelpers";
jest.mock('fs-extra');

describe('OnlineImportWorkflowHelpers.generateImportPath', function () {

  beforeEach(() => {
    const destDir = path.join(ospath.home(), 'translationCore', 'imports', 'sample_project');
    fs.ensureDirSync(destDir);
  });

  test('should succeed on valid URL', async () => {
    const url = 'https://git.door43.org/klappy/bhadrawahi_tit.git';
    let importPath = await generateImportPath(url);
    expect(importPath).toEqual(expect.stringMatching(/.*translationCore\/imports\/bhadrawahi_tit/));
  });

  test('should throw error if already exists', async () => {
    const url = 'https://git.door43.org/klappy/sample_project.git';
    await expect(generateImportPath(url)).rejects.toEqual(new Error("Project sample_project has already been imported."));
  });

  test('null link should show error', async () => {
    await expect(generateImportPath(null)).rejects.toEqual(new Error("The URL null does not reference a valid project"));
  });

  test('should handle missing .git', async () => {
    const url = 'https://git.door43.org/klappy/bhadrawahi_tit';
    let importPath = await generateImportPath(url);
    expect(importPath).toEqual(expect.stringMatching(/.*translationCore\/imports\/bhadrawahi_tit/));
  });

});
