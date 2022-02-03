import path from 'path';
import fs from 'fs-extra';
import ncp from 'ncp';
import AdmZip from 'adm-zip';
import * as manifestHelpers from '../js/helpers/manifestHelpers';
import * as helpers from '../js/helpers/TargetLanguageHelpers';
jest.unmock('fs-extra');
jest.unmock('adm-zip');
jest.unmock('../js/helpers/GitApi');

jest.mock('../js/selectors', () => ({
  ...require.requireActual('../js/selectors'),
  getActiveLocaleLanguage: () => ({ code: 'en' }),
}));

const cleanOutput = () => {
  fs.emptyDirSync(path.join(__dirname, 'output'));
};

beforeEach(() => {
  cleanOutput();
});

afterEach(() => {
  cleanOutput();
});

describe('generateTargetBibleFromUSFMPath', () => {
  it('generates a target bible', () => {
    const usfmPath = path.join(__dirname, 'fixtures/usfm/valid/id_tit_text_reg.usfm');
    const projectPath = path.join(__dirname, 'output/tit_from_usfm');
    const manifest = {
      'project': { 'id': 'tit' },
      'target_language': {
        'id': 'en',
        'name': 'English',
        'direction': 'ltr',
      },
    };
    helpers.generateTargetBibleFromUSFMPath(usfmPath, projectPath, manifest);
    const bookPath = path.join(projectPath, manifest.project.id);
    expect(fs.existsSync(bookPath)).toBeTruthy();
    expect(fs.existsSync(path.join(bookPath, '1.json'))).toBeTruthy();
    expect(fs.existsSync(path.join(bookPath, '2.json'))).toBeTruthy();
    expect(fs.existsSync(path.join(bookPath, '3.json'))).toBeTruthy();
  });

  it('fails to generate from missing usfm', () => {
    const usfmPath = path.join(__dirname, 'fixtures/usfm/valid/missing_file.usfm');
    const projectPath = path.join(__dirname, 'output/missing_output');
    const manifest = {
      'project': { 'id': 'tit' },
      'target_language': {
        'id': 'en',
        'name': 'English',
        'direction': 'ltr',
      },
    };
    helpers.generateTargetBibleFromUSFMPath(usfmPath, projectPath, manifest);
    const bookPath = path.join(projectPath, manifest.project.id);
    expect(fs.existsSync(bookPath)).toBeFalsy();
  });
});

describe('generateTargetBibleFromTstudioProjectPath', () => {
  it('generates a Bible', () => {
    const srcPath = path.join(__dirname, 'fixtures/project/full_project');
    const projectPath = path.join(__dirname, 'output/generate_from_project');
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
      // perform test
      const manifest = {
        project: { id: 'gen' },
        target_language: {
          id: 'en',
          name: 'English',
          direction: 'ltr',
        },
      };
      helpers.generateTargetBibleFromTstudioProjectPath(projectPath, manifest);
      const bookPath = path.join(projectPath, manifest.project.id);
      expect(fs.existsSync(path.join(bookPath, '1.json'))).toBeTruthy();
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
        'project': { id: 'tit' },
        'target_language': {
          'direction': 'ltr',
          'id': 'abu',
          'name': 'Abure',
        },
      };
      helpers.generateTargetBibleFromTstudioProjectPath(projectPath, manifest);
      const bookPath = path.join(projectPath, manifest.project.id);
      expect(fs.existsSync(path.join(bookPath, '1.json'))).toBeTruthy();
      expect(fs.existsSync(path.join(bookPath, '2.json'))).toBeFalsy();
      expect(fs.readJSONSync(path.join(bookPath, '3.json'))[8]).toBeDefined();
      expect(fs.readJSONSync(path.join(bookPath, '3.json'))[3]).toBeDefined();
    });
  });

  it('generates a Bible from tstudio project with 00 folder', () => {
    const projectName = 'aaa_php_text_ulb';
    const srcPath = path.join(__dirname, 'fixtures/project/tstudio_project/' + projectName + '.tstudio');
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
    const headers = fs.readJSONSync(path.join(bookPath, 'headers.json'));
    expect(headers.length).toEqual(1);
  });

  it('generates a Bible from tstudio project with front folder', () => {
    const projectName = 'en_php_text_reg';
    const srcPath = path.join(__dirname, 'fixtures/project/tstudio_project/' + projectName + '.tstudio');
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
    const headers = fs.readJSONSync(path.join(bookPath, 'headers.json'));
    expect(headers.length).toEqual(16);
  });
});
