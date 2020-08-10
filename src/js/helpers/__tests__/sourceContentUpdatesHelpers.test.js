import path from 'path';
import fs from 'fs-extra';
// helpers
import * as sourceContentUpdatesHelpers from '../sourceContentUpdatesHelpers';
// constants
import { USER_RESOURCES_PATH } from '../../common/constants';

describe('migrate resources', () => {
  const sourceResourcesPath = path.join('src', '__tests__', 'fixtures', 'resources');

  beforeEach(() => {
    fs.__resetMockFS();
  });

  it('getResources', () => {
    // given
    const resourcesPath = USER_RESOURCES_PATH;
    const copyResourceFiles = [
      'en',
      'el-x-koine',
      'hbo'];
    fs.__loadFilesIntoMockFs(copyResourceFiles, sourceResourcesPath, resourcesPath);

    // when
    const resources = sourceContentUpdatesHelpers.getLocalResourceList();

    // then
    expect(resources).toMatchSnapshot();
  });
});
