/* eslint-env jest */
//helpers
import * as exportHelpers from '../src/js/helpers/exportHelpers';
jest.mock('fs-extra');

describe('exportHelpers.getUsfmExportName', () => {
  it('should get the name of a titus project according to the standard', () => {
    const manifest = {
      project: {
        id: 'tit'
      }
    };
    const expectedFileName = '57-TIT';
    const projectName = exportHelpers.getUsfmExportName(manifest);
    expect(projectName).toBe(expectedFileName);
  });
  it('shouldn\'t get the name of a titus project if the manifest is missing', () => {
    const manifest = {
      project: {}
    };
    const projectName = exportHelpers.getUsfmExportName(manifest);
    expect(projectName).toBe(undefined);
  });
});

