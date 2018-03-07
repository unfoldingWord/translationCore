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

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const cleanOutput = () => {
  const files = fs.readdirSync(path.join(__dirname, 'output'));
  for (let f of files) {
    if(f === '.keep') continue;
    rimraf.sync(path.join(__dirname, 'output', f));
  }
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
        "resource_id": "ulb",
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
      "id": "ulb",
      "name": "Unlocked Literal Bible"
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
        projectSaveLocation: path.join(__dirname, 'fixtures/project/manifest')
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
        projectSaveLocation: path.join(__dirname, 'fixtures/project/manifest')
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
        projectSaveLocation: path.join(__dirname, 'fixtures/project/manifest')
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
        projectSaveLocation: path.join(__dirname, 'fixtures/project/manifest')
      }
    };
    const store = mockStore(initialState);
    store.dispatch(actions.loadTargetLanguageChapter('1'));

    expect(store.getActions()).toEqual(expectedActions);
  });
});

describe('generateTargetBibleFromUSFMPath', () => {

  it('generates a target bible', () => {
    const usfmPath = path.join(__dirname, 'fixtures/usfm/valid/id_tit_text_reg.usfm');
    const projectPath = path.join(__dirname, 'output/tit_from_usfm');
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
    actions.generateTargetBibleFromUSFMPath(usfmPath, projectPath, manifest);
    const bookPath = path.join(projectPath, manifest.project.id);
    expect(fs.existsSync(bookPath)).toBeTruthy();
    expect(fs.existsSync(path.join(bookPath, 'manifest.json'))).toBeTruthy();
    expect(fs.existsSync(path.join(bookPath, '1.json'))).toBeTruthy();
    expect(fs.existsSync(path.join(bookPath, '2.json'))).toBeTruthy();
    expect(fs.existsSync(path.join(bookPath, '3.json'))).toBeTruthy();
  });

  it('fails to generate from missing usfm', () => {
    const usfmPath = path.join(__dirname, 'fixtures/usfm/valid/missing_file.usfm');
    const projectPath = path.join(__dirname, 'output/missing_output');
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
    actions.generateTargetBibleFromUSFMPath(usfmPath, projectPath, manifest);
    const bookPath = path.join(projectPath, manifest.project.id);
    expect(fs.existsSync(bookPath)).toBeFalsy();
  });
});

describe('generateTargetBibleFromProjectPath', () => {
  it('generates a Bible', () => {
    const srcPath = path.join(__dirname, 'fixtures/project/full_project');
    const projectPath = path.join(__dirname, 'output/generate_from_project');
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
      actions.generateTargetBibleFromProjectPath(projectPath, manifest);
      const bookPath = path.join(projectPath, manifest.project.id);
      expect(fs.existsSync(path.join(bookPath, '1.json'))).toBeTruthy();
      expect(fs.existsSync(path.join(bookPath, 'manifest.json'))).toBeTruthy();
    });

  });

  it('generates a Bible w/ single chunks', () => {
    const srcPath = path.join(__dirname, 'fixtures/project/single_chunks');
    const projectPath = path.join(__dirname, 'output/single_chunks');
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
      actions.generateTargetBibleFromProjectPath(projectPath, manifest);
      const bookPath = path.join(projectPath, manifest.project.id);
      expect(fs.existsSync(path.join(bookPath, '1.json'))).toBeTruthy();
      expect(fs.existsSync(path.join(bookPath, '2.json'))).toBeFalsy();
      expect(fs.readJSONSync(path.join(bookPath, '3.json'))[8]).toBeDefined();
      expect(fs.readJSONSync(path.join(bookPath, '3.json'))[3]).toBeDefined();
      expect(fs.existsSync(path.join(bookPath, 'manifest.json'))).toBeTruthy();
    });

  });

  it('generates a Bible from tstudio project', () => {
    const projectName = 'aaa_php_text_ulb';
    const srcPath = path.join(__dirname, 'fixtures/project/tstudio_project/' + projectName + '.tstudio');
    const unzipPath = path.join(__dirname, 'output', projectName);
    const projectPath = path.join(unzipPath, projectName);
    const zip = new AdmZip(srcPath);
    zip.extractAllTo(unzipPath, /*overwrite*/true); // extract .tstudio project
    const manifest = manifestHelpers.getProjectManifest(projectPath);

    actions.generateTargetBibleFromProjectPath(projectPath, manifest);
    const bookPath = path.join(projectPath, manifest.project.id);
    expect(fs.existsSync(path.join(bookPath, '1.json'))).toBeTruthy();
    expect(fs.existsSync(path.join(bookPath, '2.json'))).toBeFalsy();
    expect(fs.readJSONSync(path.join(bookPath, '3.json'))[8]).toBeDefined();
    expect(fs.readJSONSync(path.join(bookPath, '3.json'))[3]).toBeDefined();
    expect(fs.existsSync(path.join(bookPath, 'manifest.json'))).toBeTruthy();
  });

});
