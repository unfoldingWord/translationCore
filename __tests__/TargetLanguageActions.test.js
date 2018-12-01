jest.unmock('fs-extra');
jest.unmock('adm-zip');
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import path from 'path';
import fs from 'fs-extra';
import rimraf from 'rimraf';
import ncp from 'ncp';
import AdmZip from 'adm-zip';
import * as actions from '../src/js/actions/TargetLanguageActions';
import * as manifestHelpers from "../src/js/helpers/manifestHelpers";
import * as helpers from '../src/js/helpers/TargetLanguageHelpers';

jest.mock('../src/js/selectors', () => ({
  ...require.requireActual('../src/js/selectors'),
  getActiveLocaleLanguage: () => {
    return {code: 'en'};
  }
}));

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const cleanOutput = () => {
  fs.emptyDirSync(path.join(__dirname, 'output'));
};

beforeEach(() => {
  cleanOutput();
});

afterEach(() => {
  cleanOutput();
});

describe('loadTargetLanguageChapter', () => {
  const manifest = {
    "generator": {
      "name": "ts-desktop",
      "build": "132"
    },
    "target_language": {
      "id": "ha",
      "name": "(Hausa) هَوُسَ",
      "direction": "ltr"
    },
    "project": {
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
        "checking_level": "3",
        "date_modified": 20170329,
        "version": "9"
      }
    ],
    "translators": [
      "Philip",
      "paul",
      "Hannatu",
      "Ora Bible Project 2"
    ],
    "checkers": [
      "RoyalSix"
    ],
    "time_created": "2017-09-11T22:02:31.737Z",
    "tools": [],
    "repo": "",
    "tcInitialized": true,
    "package_version": 7,
    "format": "usfm",
    "resource": {
      "id": "ult",
      "name": "unfoldingWord Literal Text"
    },
    "parent_draft": {},
    "finished_chunks": [
      "front-title",
      "01-title",
      "01-01",
      "03-15"
    ]
  };

  it('loads a Bible chapter for a target language', () => {
    const expectedActions = [{
      type: 'ADD_NEW_BIBLE_TO_RESOURCES',
      bibleId: 'targetBible',
      languageId: 'targetLanguage',
      bibleData: {
        '1': {
          "1": "In the beginning...",
          "2": "When he began to create the earth..."
        },
        'manifest': manifest
      }
    }];
    const initialState = {
      projectDetailsReducer: {
        manifest: {
          project: {
            id: 'normal_project'
          }
        },
        projectSaveLocation: path.join(__dirname, 'fixtures', 'project', 'manifest')
      }
    };
    const store = mockStore(initialState);
    store.dispatch(actions.loadTargetLanguageChapter('1'));

    expect(store.getActions()).toEqual(expectedActions);
  });

  it('fails to load from missing project', () => {
    const expectedActions = [];
    const initialState = {
      projectDetailsReducer: {
        manifest: {
          project: {
            id: 'missing_project'
          }
        },
        projectSaveLocation: path.join(__dirname, 'fixtures', 'project', 'manifest')
      }
    };
    const store = mockStore(initialState);
    store.dispatch(actions.loadTargetLanguageChapter('1'));

    expect(store.getActions()).toEqual(expectedActions);
  });

  it('fails to load missing chapter', () => {
    const expectedActions = [];
    const initialState = {
      projectDetailsReducer: {
        manifest: {
          project: {
            id: 'normal_project'
          }
        },
        projectSaveLocation: path.join(__dirname, 'fixtures', 'project', 'manifest')
      }
    };
    const store = mockStore(initialState);
    store.dispatch(actions.loadTargetLanguageChapter('9'));

    expect(store.getActions()).toEqual(expectedActions);
  });

  it('fails to load missing manifest', () => {
    const expectedActions = [];
    const initialState = {
      projectDetailsReducer: {
        manifest: {
          project: {
            id: 'missing_manifest'
          }
        },
        projectSaveLocation: path.join(__dirname, 'fixtures', 'project', 'manifest')
      }
    };
    const store = mockStore(initialState);
    store.dispatch(actions.loadTargetLanguageChapter('1'));

    expect(store.getActions()).toEqual(expectedActions);
  });
});

describe('generateTargetBibleFromUSFMPath', () => {
  it('generates a target bible', () => {
    const usfmPath = path.join(__dirname, 'fixtures', 'usfm', 'valid', 'id_tit_text_reg.usfm');
    const projectPath = path.join(__dirname, 'output', 'tit_from_usfm');
    const manifest = {
      'project': {
        'id': 'tit'
      },
      'target_language': {
        'id': 'en',
        'name': 'English',
        'diretion': 'ltr'
      }
    };
    helpers.generateTargetBibleFromUSFMPath(usfmPath, projectPath, manifest);
    const bookPath = path.join(projectPath, manifest.project.id);
    expect(fs.existsSync(bookPath)).toBeTruthy();
    expect(fs.existsSync(path.join(bookPath, 'manifest.json'))).toBeTruthy();
    expect(fs.existsSync(path.join(bookPath, '1.json'))).toBeTruthy();
    expect(fs.existsSync(path.join(bookPath, '2.json'))).toBeTruthy();
    expect(fs.existsSync(path.join(bookPath, '3.json'))).toBeTruthy();
  });

  it('fails to generate from missing usfm', () => {
    const usfmPath = path.join(__dirname, 'fixtures', 'usfm', 'valid', 'missing_file.usfm');
    const projectPath = path.join(__dirname, 'output', 'missing_output');
    const manifest = {
      'project': {
        'id': 'tit'
      },
      'target_language': {
        'id': 'en',
        'name': 'English',
        'diretion': 'ltr'
      }
    };
    helpers.generateTargetBibleFromUSFMPath(usfmPath, projectPath, manifest);
    const bookPath = path.join(projectPath, manifest.project.id);
    expect(fs.existsSync(bookPath)).toBeFalsy();
  });
});

describe('generateTargetBibleFromTstudioProjectPath', () => {
  it('generates a Bible', () => {
    const srcPath = path.join(__dirname, 'fixtures', 'project', 'full_project');
    const projectPath = path.join(__dirname, 'output', 'generate_from_project');
    return new Promise((resolve, reject) => {
      // copy source to output for manipulation
      ncp(srcPath, projectPath, (err) => {
        if(err) {
          reject(err);
        } else {
          resolve();
        }
      });
    }).then(() => {
      // perform test
      const manifest = {
        project: {
          id: 'gen'
        },
        target_language: {
          id: 'en',
          name: 'English',
          direction: 'ltr'
        }
      };
      helpers.generateTargetBibleFromTstudioProjectPath(projectPath, manifest);
      const bookPath = path.join(projectPath, manifest.project.id);
      expect(fs.existsSync(path.join(bookPath, '1.json'))).toBeTruthy();
      expect(fs.existsSync(path.join(bookPath, 'manifest.json'))).toBeTruthy();
    });

  });

  it('generates a Bible w/ single chunks', () => {
    const srcPath = path.join(__dirname, 'fixtures', 'project', 'single_chunks');
    const projectPath = path.join(__dirname, 'output', 'single_chunks');
    return new Promise((resolve, reject) => {
      // copy source to output for manipulation
      ncp(srcPath, projectPath, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    }).then(() => {
      //perform test
      const manifest = {
        project: {
          id: 'tit'
        },
        "target_language": {
          "direction": "ltr",
          "id": "abu",
          "name": "Abure"
        }
      };
      helpers.generateTargetBibleFromTstudioProjectPath(projectPath, manifest);
      const bookPath = path.join(projectPath, manifest.project.id);
      expect(fs.existsSync(path.join(bookPath, '1.json'))).toBeTruthy();
      expect(fs.existsSync(path.join(bookPath, '2.json'))).toBeFalsy();
      expect(fs.readJSONSync(path.join(bookPath, '3.json'))[8]).toBeDefined();
      expect(fs.readJSONSync(path.join(bookPath, '3.json'))[3]).toBeDefined();
      expect(fs.existsSync(path.join(bookPath, 'manifest.json'))).toBeTruthy();
    });

  });

  it('generates a Bible from tstudio project with 00 folder', () => {
    const projectName = 'aaa_php_text_ulb';
    const srcPath = path.join(__dirname, 'fixtures', 'project', 'tstudio_project', projectName + '.tstudio');
    const unzipPath = path.join(__dirname, 'output', projectName);
    const projectPath = path.join(unzipPath, projectName);
    const zip = new AdmZip(srcPath);
    zip.extractAllTo(unzipPath, /*overwrite*/true); // extract .tstudio project
    const manifest = manifestHelpers.getProjectManifest(projectPath);

    helpers.generateTargetBibleFromTstudioProjectPath(projectPath, manifest);
    const bookPath = path.join(projectPath, manifest.project.id);
    expect(fs.existsSync(path.join(bookPath, '1.json'))).toBeTruthy();
    expect(fs.existsSync(path.join(bookPath, '2.json'))).toBeTruthy();
    const json3 = fs.readJSONSync(path.join(bookPath, '3.json'));
    expect(fs.existsSync(path.join(bookPath, '4.json'))).toBeTruthy();
    expect(fs.existsSync(path.join(bookPath, '5.json'))).toBeFalsy();
    expect(json3['front']).not.toBeDefined();
    expect(json3[8]).toBeDefined();
    expect(json3[3]).toBeDefined();
    expect(json3[22]).not.toBeDefined();
    expect(fs.existsSync(path.join(bookPath, 'manifest.json'))).toBeTruthy();
    const headers = fs.readJSONSync(path.join(bookPath, 'headers.json'));
    expect(headers.length).toEqual(1);
  });

  it('generates a Bible from tstudio project with front folder', () => {
    const projectName = 'en_php_text_reg';
    const srcPath = path.join(__dirname, 'fixtures', 'project', 'tstudio_project', projectName + '.tstudio');
    const unzipPath = path.join(__dirname, 'output', projectName);
    const projectPath = path.join(unzipPath, projectName);
    const zip = new AdmZip(srcPath);
    zip.extractAllTo(unzipPath, /*overwrite*/true); // extract .tstudio project
    const manifest = manifestHelpers.getProjectManifest(projectPath);

    helpers.generateTargetBibleFromTstudioProjectPath(projectPath, manifest);
    const bookPath = path.join(projectPath, manifest.project.id);
    const json1 = fs.readJSONSync(path.join(bookPath, '1.json'));
    expect(json1['front']).toBeDefined();
    const json2 = fs.readJSONSync(path.join(bookPath, '2.json'));
    expect(json2['front']).toBeDefined();
    const json3 = fs.readJSONSync(path.join(bookPath, '3.json'));
    expect(json3['front']).toBeDefined();
    expect(json3[8]).toBeDefined();
    expect(json3[3]).toBeDefined();
    expect(json3[22]).not.toBeDefined();
    const json4 = fs.readJSONSync(path.join(bookPath, '4.json'));
    expect(json4['front']).toBeDefined();
    expect(fs.existsSync(path.join(bookPath, '5.json'))).toBeFalsy();
    expect(fs.existsSync(path.join(bookPath, 'manifest.json'))).toBeTruthy();
    const headers = fs.readJSONSync(path.join(bookPath, 'headers.json'));
    expect(headers.length).toEqual(16);
  });
});
