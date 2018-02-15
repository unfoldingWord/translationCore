/* eslint-env jest */
import path from 'path-extra';
import ospath from 'ospath';
import fs from "fs-extra";
//helpers
import * as USFMExportActions from '../src/js/actions/USFMExportActions';
import * as UsfmHelpers from "../src/js/helpers/usfmHelpers";
const PROJECTS_PATH = path.join(ospath.home(), 'translationCore', 'projects');
const RESOURCE_PATH = path.join(ospath.home(), 'Development','Electron','translationCore', 'tC_resources', 'resources');

describe('USFMExportActions', () => {
  const sourceProject = 'en_gal';
  const headers = [
    {
      "tag": "id",
      "content": "GAL N/A cdh_Chambeali_ltr Mon Sep 11 2017 16:44:56 GMT-0700 (PDT) tc"
    },
    {
      "tag": "h",
      "content": "Galatians"
    },
    {
      "tag": "mt",
      "content": "Galatians"
    },
    {
      "tag": "s5",
      "type": "section"
    }
  ];

  beforeEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
    fs.__setMockFS({}); // initialize to empty
    const sourcePath = "__tests__/fixtures/project/";
    let copyFiles = [sourceProject];
    fs.__loadFilesIntoMockFs(copyFiles, sourcePath, PROJECTS_PATH);
    const resourcePath = "__tests__/fixtures/resources/";
    copyFiles = ['en/bibles/ulb/v11'];
    fs.__loadFilesIntoMockFs(copyFiles, resourcePath, RESOURCE_PATH);
  });
  afterEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
  });

  test('should convert project with headers.json', () => {
    // given
    const projectFolder = path.join(PROJECTS_PATH, sourceProject);
    fs.outputJsonSync(path.join(projectFolder, 'gal', 'headers.json'), headers);

    // when
    const results = USFMExportActions.setUpUSFMJSONObject(projectFolder);

    // then
    expect(results).toBeTruthy();
    validateHeaderTagPresent(results.headers, 'id');
    validateHeaderTag(results.headers, headers, 'h');
  });

  //
  // helpers
  //

  function validateHeaderTag(results_header_data, expected_header_data, tag) {
    const data = UsfmHelpers.getHeaderTag(results_header_data, tag);
    const expected_data = UsfmHelpers.getHeaderTag(expected_header_data, tag);
    expect(data).toEqual(expected_data);
  }

  function validateHeaderTagPresent(results_header_data,tag) {
    const data = UsfmHelpers.getHeaderTag(results_header_data, tag);
    expect(data).toBeTruthy();
  }
});
