/* eslint-env jest */
/* eslint-disable no-console */
import fs from 'fs-extra';
import path from 'path-extra';
// helpers
import * as CopyrightCheckHelpers from '../js/helpers/CopyrightCheckHelpers';

jest.mock('fs-extra');

const ccBYSA = `# License
## Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)

This is a human-readable summary of (and not a substitute for) the [license](http://creativecommons.org/licenses/by-sa/4.0/).

### You are free to:

  * **Share** — copy and redistribute the material in any medium or format
  * **Adapt** — remix, transform, and build upon the material

for any purpose, even commercially.

The licensor cannot revoke these freedoms as long as you follow the license terms.

### Under the following conditions:

  * **Attribution** — You must attribute the work as follows: "Original work available at https://door43.org/." Attribution statements in derivative works should not in any way suggest that we endorse you or your use of this work.
  * **ShareAlike** — If you remix, transform, or build upon the material, you must distribute your contributions under the same license as the original.

**No additional restrictions** — You may not apply legal terms or technological measures that legally restrict others from doing anything the license permits.

### Notices:

You do not have to comply with the license for elements of the material in the public domain or where your use is permitted by an applicable exception or limitation.

No warranties are given. The license may not give you all of the permissions necessary for your intended use. For example, other rights such as publicity, privacy, or moral rights may limit how you use the material.
`;

describe('CopyrightCheckHelpers.saveProjectLicense', () => {
  beforeEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
    let directory = path.join('src', 'assets', 'projectLicenses', 'CC BY-SA 4.0.md');
    // Set up mocked out filePath and data in mock filesystem before each test
    fs.__setMockFS({ [directory]: ccBYSA });
  });
  afterEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
  });
  test('saveProjectLicense should save a project license in fs as LICENSE.md', async () => {
    await CopyrightCheckHelpers.saveProjectLicense('CC BY-SA 4.0', path.join('path', 'to', 'project'));
    expect(fs.existsSync(path.join('path', 'to', 'project', 'LICENSE.md'))).toBeTruthy();
  });
});

describe('CopyrightCheckHelpers.loadProjectLicenseMarkdownFile', () => {
  beforeEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
    // Set up some mocked out file info before each test
    const directory = path.join('src', 'assets', 'projectLicenses', 'CC BY-SA 4.0.md');

    // Set up mocked out filePath and data in mock filesystem before each test
    fs.__setMockFS({ [directory]: ccBYSA });
  });

  test('loadProjectLicenseMarkdownFile should load LICENSE.md for CC BY-SA 4.0', () => {
    const result = CopyrightCheckHelpers.loadProjectLicenseMarkdownFile('CC BY-SA 4.0');
    expect(result).toEqual(ccBYSA);
  });
});

describe('CopyrightCheckHelpers.assignLicenseToOnlineImportedProject', () => {
  beforeEach(() => {
    // Set up some mocked out file info before each test
    const directory = path.join('src', 'assets', 'projectLicenses', 'CC BY-SA 4.0.md');

    // Set up mocked out filePath and data in mock filesystem before each test
    fs.__setMockFS({ [path.join('path', 'to', 'project', 'manifest.json')]: {}, [directory]: ccBYSA });
  });

  test('assignLicenseToOnlineImportedProject should add the license CC BY-SA 4.0 to a project manifest and save the LICENSE.MD', async () => {
    await CopyrightCheckHelpers.assignLicenseToOnlineImportedProject(path.join('path', 'to', 'project'));
    expect(fs.readJsonSync(path.join('path', 'to', 'project', 'manifest.json'))).toEqual({ license:'CC BY-SA 4.0' });
  });
});

