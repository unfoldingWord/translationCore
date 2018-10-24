/* eslint-env jest */
//helpers
import * as exportHelpers from '../src/js/helpers/exportHelpers';
import * as manifestHelpers from '../src/js/helpers/manifestHelpers';
import path from 'path-extra';

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

describe('exportHelpers.getHeaderTags', () => {
  it('should get the usfm header of a titus project according to the standard', () => {
    manifestHelpers.getProjectManifest = jest.fn( () => { 
      const manifest = {
        "target_language": {
          "id": "en",
          "name": "English",
          "direction": "ltr",
          "book": {
            "name": "2 Peter"
          }
        },
        "project": {
          "id": "2PE"
        },
        "source_translations": [
          {
            "language_id": "en",
            "resource_id": "ult"
          }
        ],
        "resource": {
          "id": "xyz",
          "name": "xyz is translation id"
        }
      };
    
      return manifest;  
    });

    let projectSaveLocation = path.join('fixtures', 'project', 'en_2pe');
    const expectedResult = "2PE EN_XYZ en_English_ltr Not-a-real-date tc";
    const header = exportHelpers.getHeaderTags(projectSaveLocation);
    expect(header[0].content).toBe(expectedResult);
  });
});

