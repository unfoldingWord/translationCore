/* eslint-env jest */
/* eslint-disable no-console */
import path from 'path';
import fs from 'fs-extra';
import * as ProjectSettingsHelpers from '../js/helpers/ProjectSettingsHelpers';

describe('ProjectSettingsHelpers tests', () => {
  const projectWithSettingsPath = path.join(__dirname, 'fixtures/project/en_gal');
  const projectWithoutSettingsPath = path.join(__dirname, 'fixtures/project/en_tit');

  beforeEach(() => {
    fs.__resetMockFS();
    fs.__loadDirIntoMockFs(projectWithSettingsPath, projectWithSettingsPath);
    fs.__loadDirIntoMockFs(projectWithoutSettingsPath, projectWithoutSettingsPath);
  });
  afterEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
  });

  it('get settings of project with a settings.json', () => {
    const settings = ProjectSettingsHelpers.getProjectSettings(projectWithSettingsPath);
    const expectedSettings = fs.readJSONSync(path.join(projectWithSettingsPath, 'settings.json'));
    expect(settings).toEqual(expectedSettings);
  });

  it('get settings of project without a settings.json', () => {
    const settings = ProjectSettingsHelpers.getProjectSettings(projectWithoutSettingsPath);
    const expectedSettings = { last_opened: null };
    expect(settings).toEqual(expectedSettings);
    expect(fs.existsSync(path.join(projectWithoutSettingsPath, 'settings.json'))).toBeTruthy();
  });
});
