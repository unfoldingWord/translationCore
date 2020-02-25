/* eslint-disable import/named,quotes,comma-dangle,object-curly-newline */
import * as OL_Helpers from '../originalLanguageResourcesHelpers';
import { TRANSLATION_NOTES, TRANSLATION_WORDS, WORD_ALIGNMENT } from '../../common/constants';

describe('isToolUsingCurrentOriginalLanguage()', () => {
  it('in tN, expect same same versions to be current OL', () => {
    // given
    const currentOlVersion = "0.10";
    const toolOlVersion = "0.10";
    const state = initState(currentOlVersion, toolOlVersion);
    const expectedIsCurrentOL = true;

    // when
    const isCurrentOL = OL_Helpers.isToolUsingCurrentOriginalLanguage(state, TRANSLATION_NOTES);

    // then
    expect(isCurrentOL).toEqual(expectedIsCurrentOL);
  });

  it('in tN, expect different versions not to be current OL', () => {
    // given
    const currentOlVersion = "0.9";
    const toolOlVersion = "0.10";
    const state = initState(currentOlVersion, toolOlVersion);
    const expectedIsCurrentOL = false;

    // when
    const isCurrentOL = OL_Helpers.isToolUsingCurrentOriginalLanguage(state, TRANSLATION_NOTES);

    // then
    expect(isCurrentOL).toEqual(expectedIsCurrentOL);
  });

  it('in tN expect not to crash if original language not loaded', () => {
    // given
    const currentOlVersion = "0.9";
    const toolOlVersion = "0.10";
    const state = initState(currentOlVersion, toolOlVersion);
    state.resourcesReducer.bibles = {};
    const expectedIsCurrentOL = false;

    // when
    const isCurrentOL = OL_Helpers.isToolUsingCurrentOriginalLanguage(state, TRANSLATION_NOTES);

    // then
    expect(isCurrentOL).toEqual(expectedIsCurrentOL);
  });

  it('in tN expect not to crash if tsv_relations missing', () => {
    // given
    const currentOlVersion = "0.9";
    const toolOlVersion = "0.10";
    const state = initState(currentOlVersion, toolOlVersion);
    delete state.projectDetailsReducer.manifest.tsv_relation;
    const expectedIsCurrentOL = false;

    // when
    const isCurrentOL = OL_Helpers.isToolUsingCurrentOriginalLanguage(state, TRANSLATION_NOTES);

    // then
    expect(isCurrentOL).toEqual(expectedIsCurrentOL);
  });

  it('in tN, expect not to crash if tsv_relations does not have the tN dependency', () => {
    // given
    const currentOlVersion = "0.9";
    const toolOlVersion = "0.10";
    const state = initState(currentOlVersion, toolOlVersion);
    state.projectDetailsReducer.manifest.tsv_relation = [];
    const expectedIsCurrentOL = false;

    // when
    const isCurrentOL = OL_Helpers.isToolUsingCurrentOriginalLanguage(state, TRANSLATION_NOTES);

    // then
    expect(isCurrentOL).toEqual(expectedIsCurrentOL);
  });

  it('expect not to crash if project details not loaded', () => {
    // given
    const currentOlVersion = "0.9";
    const toolOlVersion = "0.10";
    const state = initState(currentOlVersion, toolOlVersion);
    state.projectDetailsReducer.projectSaveLocation = "";
    const expectedIsCurrentOL = false;

    // when
    const isCurrentOL = OL_Helpers.isToolUsingCurrentOriginalLanguage(state, TRANSLATION_NOTES);

    // then
    expect(isCurrentOL).toEqual(expectedIsCurrentOL);
  });

  it('in WA, expect always current OL', () => {
    // given
    const currentOlVersion = "0.9";
    const toolOlVersion = "0.10";
    const state = initState(currentOlVersion, toolOlVersion);
    const expectedIsCurrentOL = true;

    // when
    const isCurrentOL = OL_Helpers.isToolUsingCurrentOriginalLanguage(state, WORD_ALIGNMENT);

    // then
    expect(isCurrentOL).toEqual(expectedIsCurrentOL);
  });

  it('in tW, expect always current OL', () => {
    // given
    const currentOlVersion = "0.9";
    const toolOlVersion = "0.10";
    const state = initState(currentOlVersion, toolOlVersion);
    const expectedIsCurrentOL = true;

    // when
    const isCurrentOL = OL_Helpers.isToolUsingCurrentOriginalLanguage(state, TRANSLATION_WORDS);

    // then
    expect(isCurrentOL).toEqual(expectedIsCurrentOL);
  });
});

//
// Helpers
//

function initState(currentOlVersion, toolOlVersion) {
  const tnDependency = "el-x-koine/ugnt?v=" + toolOlVersion;
  const state = {
    resourcesReducer: {
      bibles: {
        originalLanguage: {
          ugnt: {
            manifest: {
              language_id: "el-x-koine",
              resource_id: "ugnt",
              dublin_core: {
                version: currentOlVersion // e.g. "0.9"
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
          "translationNotes": "en",
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
        "tsv_relation": [
          "en/ult",
          tnDependency,
          "hbo/uhb?v=2.1.8"
        ],
        "tc_edit_version": "2.1.1",
        "tc_min_compatible_version": "2.1.0"
      },
      "projectType": null,
    }
  };
  return state;
}
