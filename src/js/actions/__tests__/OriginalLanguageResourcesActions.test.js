/* eslint-disable import/named,quotes,comma-dangle,object-curly-newline */
import fs from 'fs-extra';
import path from 'path-extra';
import thunk from "redux-thunk";
import { resourcesHelpers } from 'tc-source-content-updater';
import configureMockStore from "redux-mock-store";
import * as OL_Actions from '../OriginalLanguageResourcesActions';
import { USER_RESOURCES_PATH } from '../../common/constants';

// Mock store set up
const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('updateProjectResourcesForTn()', () => {
  beforeEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
  });

  it('if original language versions same then do nothing', () => {
    // given
    const currentOlVersion = "0.10_Door43-Catalog";
    const toolOlVersion = "0.10_Door43-Catalog";
    const latestTnOlVersion = "0.10_Door43-Catalog";
    const state = initState(currentOlVersion, toolOlVersion, latestTnOlVersion);
    const store = mockStore(state);
    const expectedActions = [];

    // when
    store.dispatch(OL_Actions.updateProjectResourcesForTn());

    // then
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('if original language versions different then update', () => {
    // given
    const currentOlVersion = "0.10_Door43-Catalog";
    const toolOlVersion = "0.10_Door43-Catalog";
    const latestTnOlVersion = "0.11_Door43-Catalog";
    const state = initState(currentOlVersion, toolOlVersion, latestTnOlVersion);
    const store = mockStore(state);
    const expectedActions = [
      { "propertyName": "tsv_relation", "type": "ADD_MANIFEST_PROPERTY", "value": ["en/ult", "el-x-koine/ugnt?v=0.11", "hbo/uhb?v=2.1.8"] }
    ];

    // when
    store.dispatch(OL_Actions.updateProjectResourcesForTn());

    // then
    expect(store.getActions()).toEqual(expectedActions);
  });
});

//
// Helpers
//

function generateTsvRelation(toolOlVersion) {
  const tnDependency = "el-x-koine/ugnt?v=" + resourcesHelpers.splitVersionAndOwner(toolOlVersion).version;
  const tsvRelation = [
    "en/ult",
    tnDependency,
    "hbo/uhb?v=2.1.8"
  ];
  return tsvRelation;
}

function initState(latestOlVersion, toolOlVersion, latestTnOlVersion, latestTnVersion = 'v10_Door43-Catalog') {
  const origLangId = "el-x-koine";
  const origLangBible = "ugnt";
  const translationNotesGl = "en";
  const state = {
    resourcesReducer: {
      bibles: {
        originalLanguage: {
          ugnt: {
            manifest: {
              language_id: origLangId,
              resource_id: origLangBible,
              dublin_core: {
                version: resourcesHelpers.splitVersionAndOwner(latestOlVersion).version // e.g. "0.9"
              }
            }
          }
        }
      }
    },
    projectDetailsReducer: {
      "projectSaveLocation": "/Users/blm/translationCore/projects/en_alcz_tit_book",
      "manifest": {
        "project": {
          "id": "tit",
          "name": "Titus"
        },
        "resource": {
          "id": "alcz",
          "name": ""
        },
        "toolsSelectedGLs": {
          "translationNotes": translationNotesGl,
          "wordAlignment": "en",
          "translationWords": "en"
        },
        "generator": {
          "name": "tc-desktop",
          "build": ""
        },
        "target_language": {
          "id": "en",
          "name": "English",
          "direction": "ltr",
          "book": {
            "name": "Titus"
          }
        },
        "ts_project": {
          "id": "tit",
          "name": "Titus"
        },
        "type": {
          "id": "text",
          "name": "Text"
        },
        "source_translations": [
          {
            "language_id": "en",
            "resource_id": "ult",
            "checking_level": "",
            "date_modified": "2019-08-07T16:11:27.746Z",
            "version": ""
          }
        ],
        "translators": [],
        "checkers": [],
        "time_created": "2019-08-07T16:11:27.746Z",
        "tools": [],
        "repo": "",
        "tcInitialized": true,
        "tc_version": 7,
        "license": "CC BY-SA 4.0",
        "tsv_relation":  generateTsvRelation(toolOlVersion),
        "tc_edit_version": "2.1.1",
        "tc_min_compatible_version": "2.1.0"
      },
      "projectType": null,
    }
  };
  // init resources
  const bibleFolderPath = path.join(USER_RESOURCES_PATH, origLangId, 'bibles', origLangBible);
  const latestVersionFolder = path.join(bibleFolderPath, latestOlVersion);
  fs.ensureDirSync(latestVersionFolder);

  const resourcesPath = path.join(USER_RESOURCES_PATH, translationNotesGl, 'translationHelps/translationNotes');
  const latestResourcesPath = path.join(resourcesPath, latestTnVersion);
  fs.ensureDirSync(latestResourcesPath);
  const tnManifest = {
    dublin_core: {
      relation:  generateTsvRelation(latestTnOlVersion)
    }
  };
  const manifestPath = path.join(latestResourcesPath, 'manifest.json');
  fs.outputJsonSync(manifestPath, tnManifest);

  return state;
}
