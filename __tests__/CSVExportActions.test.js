/* eslint-env jest */
/* eslint-disable no-console */
import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import reducers from '../src/js/reducers';
import fs from 'fs-extra';
import path from 'path-extra';
// actions
import * as csvExportActions from '../src/js/actions/CSVExportActions';
import * as ProjectImportStepperActions
  from '../src/js/actions/ProjectImportStepperActions';
import * as AlertModalActions from '../src/js/actions/AlertModalActions';
// helpers
import * as csvHelpers from '../src/js/helpers/csvHelpers';
import {USER_RESOURCES_PATH, TRANSLATION_WORDS, TRANSLATION_NOTES} from '../src/js/common/constants';

jest.mock('../src/js/selectors', () => ({
  ...require.requireActual('../src/js/selectors'),
  getActiveLocaleLanguage: () => {
    return {code: 'en'};
  },
  getTranslate: () => {
    return jest.fn((code) => {
      return code;
    });
  }
}));

// data
const noChecksPerformedPath = path.join(__dirname,
  'fixtures/project/csv/no_checks_performed/fr_eph_text_ulb');
const checksPerformedPath = path.join(__dirname,
  'fixtures/project/csv/checks_performed/fr_eph_text_ulb');
const bogusFilesInCheckDataPath = path.join(__dirname,
  'fixtures/project/csv/bogus_files/abu_tit_text_reg');
const projectOpenedAutographa = path.join(__dirname,
  'fixtures/project/csv/project_opened_autographa/ar_eph_text_ulb');
const testOutputPath = path.join(__dirname, 'output');

const fixtures = path.join(__dirname, 'fixtures');
const project = path.join(fixtures, 'project');
const outDir = path.join(testOutputPath, '1');

beforeAll(() =>
{
  fs.__resetMockFS();
  fs.ensureDirSync(outDir);
  fs.__loadDirIntoMockFs(project, project);
  fs.__loadDirIntoMockFs(path.join(fixtures, 'resources'), USER_RESOURCES_PATH);
});

describe('csv export actions', () => {

  describe('csvExportActions.saveToolDataToCSV for translationWords', () => {

    test('should resolve true for checksPerformedPath', () => {
      const translate = (key) => key;
      return csvExportActions.saveToolDataToCSV(TRANSLATION_WORDS,
        checksPerformedPath, translate)
        .then((value) => {
          expect(value).toEqual(true);
          csvHelpers.cleanupTmpPath(checksPerformedPath);
        })
        .catch(err => {
          console.log(err);
          expect(err).toEqual('');
          const dataPath = csvHelpers.dataPath(checksPerformedPath);
          const tWFilePath = path.join(dataPath, 'output',
            'translationWords_CheckData.csv');
          expect(fs.existsSync(tWFilePath)).toEqual(true);
          const tNFilePath = path.join(dataPath, 'output',
            'translationNotes_CheckData.csv');
          expect(fs.existsSync(tNFilePath)).toEqual(true);
          csvHelpers.cleanupTmpPath(checksPerformedPath);
        });
    });

    test('should resolve true for bogusFilesInCheckDataPath', () => {
      const translate = (key) => key;
      return csvExportActions.saveToolDataToCSV(TRANSLATION_WORDS,
        bogusFilesInCheckDataPath, translate)
        .then((resolve) => {
          expect(resolve).toEqual(true);
          csvHelpers.cleanupTmpPath(TRANSLATION_WORDS,
            bogusFilesInCheckDataPath);
        })
        .catch(err => {
          console.log(err);
          expect(err).toEqual('');
          csvHelpers.cleanupTmpPath(bogusFilesInCheckDataPath);
        });
    });
  });

  describe('csvExportActions.saveToolDataToCSV for translationNotes', () => {

    test('should resolve true for checksPerformedPath', () => {
      const translate = (key) => key;
      return csvExportActions.saveToolDataToCSV(TRANSLATION_NOTES,
        checksPerformedPath, translate)
        .then((value) => {
          expect(value).toEqual(true);
          csvHelpers.cleanupTmpPath(checksPerformedPath);
        })
        .catch(err => {
          console.log(err);
          expect(err).toEqual('');
          const dataPath = csvHelpers.dataPath(checksPerformedPath);
          const tNFilePath = path.join(dataPath, 'output',
            'translationNotes_CheckData.csv');
          expect(fs.existsSync(tNFilePath)).toEqual(true);
          csvHelpers.cleanupTmpPath(checksPerformedPath);
        });
    });

    test('should resolve true for bogusFilesInCheckDataPath', () => {
      const translate = (key) => key;
      return csvExportActions.saveToolDataToCSV(TRANSLATION_NOTES,
        bogusFilesInCheckDataPath, translate)
        .then((resolve) => {
          expect(resolve).toEqual(true);
          csvHelpers.cleanupTmpPath(TRANSLATION_NOTES,
            bogusFilesInCheckDataPath);
        })
        .catch(err => {
          console.log(err);
          expect(err).toEqual('');
          csvHelpers.cleanupTmpPath(bogusFilesInCheckDataPath);
        });
    });
  });

  describe('csvExportActions.saveVerseEditsToCSV', () => {
    test('should resolve true for checksPerformedPath', () => {
      const translate = key => key;
      return csvExportActions.saveVerseEditsToCSV(checksPerformedPath, translate)
        .then((value) => {
          expect(value).toEqual(true);
          const dataPath = csvHelpers.dataPath(checksPerformedPath);
          const filePath = path.join(dataPath, 'output', 'VerseEdits.csv');
          expect(fs.existsSync(filePath)).toEqual(true);
          csvHelpers.cleanupTmpPath(checksPerformedPath);
        })
        .catch(err => {
          expect(err).toEqual('');
          csvHelpers.cleanupTmpPath(checksPerformedPath);
        });
    });

    test('should resolve true for bogusFilesInCheckDataPath', () => {
      const translate = key => key;
      return csvExportActions.saveVerseEditsToCSV(bogusFilesInCheckDataPath, translate)
        .then((value) => {
          expect(value).toEqual(true);
          const dataPath = csvHelpers.dataPath(bogusFilesInCheckDataPath);
          const filePath = path.join(dataPath, 'output', 'VerseEdits.csv');
          expect(fs.existsSync(filePath)).toEqual(true);
          csvHelpers.cleanupTmpPath(bogusFilesInCheckDataPath);
        })
        .catch(err => {
          expect(err).toEqual('');
          csvHelpers.cleanupTmpPath(bogusFilesInCheckDataPath);
        });
    });
  });

  describe('csvExportActions.saveCommentsToCSV', () => {
    test('should resolve true for checksPerformedPath', () => {
      const translate = key => key;
      return csvExportActions.saveCommentsToCSV(checksPerformedPath, translate)
        .then((value) => {
          expect(value).toEqual(true);
          const dataPath = csvHelpers.dataPath(checksPerformedPath);
          const filePath = path.join(dataPath, 'output', 'Comments.csv');
          expect(fs.existsSync(filePath)).toEqual(true);
          csvHelpers.cleanupTmpPath(checksPerformedPath);
        })
        .catch(err => {
          expect(err).toEqual('');
          csvHelpers.cleanupTmpPath(checksPerformedPath);
        });
    });

    test('should resolve true for bogusFilesInCheckDataPath', () => {
      const translate = key => key;
      return csvExportActions.saveCommentsToCSV(bogusFilesInCheckDataPath, translate)
        .then((value) => {
          expect(value).toEqual(true);
          const dataPath = csvHelpers.dataPath(bogusFilesInCheckDataPath);
          const filePath = path.join(dataPath, 'output', 'Comments.csv');
          expect(fs.existsSync(filePath)).toEqual(true);
          csvHelpers.cleanupTmpPath(bogusFilesInCheckDataPath);
        })
        .catch(err => {
          expect(err).toEqual('');
          csvHelpers.cleanupTmpPath(bogusFilesInCheckDataPath);
        });
    });
  });

  describe('csvExportActions.saveSelectionsToCSV', () => {
    test('should resolve true for checksPerformedPath', () => {
      const translate = key => key;
      return csvExportActions.saveSelectionsToCSV(checksPerformedPath, translate)
        .then((value) => {
          expect(value).toEqual(true);
          const dataPath = csvHelpers.dataPath(checksPerformedPath);
          const filePath = path.join(dataPath, 'output', 'Selections.csv');

          // verify that gatewayLanguageQuote might exist if test files were created correctly
          let csvData = fs.readFileSync(filePath, 'utf8' );
          expect(csvData).toContain('adopted",adoption,en,N/A,N/A,eph'); // quote is between instance and bookid in csv data
          expect(fs.existsSync(filePath)).toEqual(true);
          csvHelpers.cleanupTmpPath(checksPerformedPath);
        })
        .catch(err => {
          expect(err).toEqual('');
          csvHelpers.cleanupTmpPath(checksPerformedPath);
        });
    });

    test('should resolve true for bogusFilesInCheckDataPath', () => {
      const translate = key => key;
      return csvExportActions.saveSelectionsToCSV(bogusFilesInCheckDataPath, translate)
        .then((value) => {
          expect(value).toEqual(true);
          const dataPath = csvHelpers.dataPath(bogusFilesInCheckDataPath);
          const filePath = path.join(dataPath, 'output', 'Selections.csv');
          expect(fs.existsSync(filePath)).toEqual(true);
          csvHelpers.cleanupTmpPath(bogusFilesInCheckDataPath);
        })
        .catch(err => {
          expect(err).toEqual('');
          csvHelpers.cleanupTmpPath(bogusFilesInCheckDataPath);
        });
    });
  });

  describe('csvExportActions.saveRemindersToCSV', () => {
    test('should resolve true', () => {
      const translate = key => key;
      return csvExportActions.saveRemindersToCSV(checksPerformedPath, translate)
        .then((value) => {
          expect(value).toEqual(true);
          const dataPath = csvHelpers.dataPath(checksPerformedPath);
          const filePath = path.join(dataPath, 'output', 'Reminders.csv');
          expect(fs.existsSync(filePath)).toEqual(true);
          csvHelpers.cleanupTmpPath(checksPerformedPath);
        })
        .catch(err => {
          expect(err).toEqual('');
          csvHelpers.cleanupTmpPath(checksPerformedPath);
        });
    });

    test('should resolve true for bogusFilesInCheckDataPath', () => {
      const translate = key => key;
      return csvExportActions.saveRemindersToCSV(bogusFilesInCheckDataPath, translate)
        .then((value) => {
          expect(value).toEqual(true);
          const dataPath = csvHelpers.dataPath(bogusFilesInCheckDataPath);
          const filePath = path.join(dataPath, 'output', 'Reminders.csv');
          expect(fs.existsSync(filePath)).toEqual(true);
          csvHelpers.cleanupTmpPath(bogusFilesInCheckDataPath);
        })
        .catch(err => {
          expect(err).toEqual('');
          csvHelpers.cleanupTmpPath(bogusFilesInCheckDataPath);
        });
    });
  });

  describe('csvExportActions.saveAllCSVData', () => {
    test('should resolve true for checksPerformedPath', () => {
      const translate = (key) => key;
      return csvExportActions.saveAllCSVData(checksPerformedPath, translate)
        .then((resolve) => {
          expect(resolve).toEqual(true);
          csvHelpers.cleanupTmpPath(checksPerformedPath);
        })
        .catch(err => {
          expect(err).toEqual('');
          csvHelpers.cleanupTmpPath(checksPerformedPath);
        });
    });

    test('should resolve true for noChecksPerformedPath', () => {
      const translate = (key) => key;
      return csvExportActions.saveAllCSVData(noChecksPerformedPath, translate)
        .then((resolve) => {
          expect(resolve).toEqual(true);
          csvHelpers.cleanupTmpPath(noChecksPerformedPath);
        })
        .catch(err => {
          expect(err).toEqual('');
          csvHelpers.cleanupTmpPath(noChecksPerformedPath);
        });
    });

    test('should resolve true for bogusFilesInCheckDataPath', () => {
      const translate = (key) => key;
      return csvExportActions.saveAllCSVData(bogusFilesInCheckDataPath, translate)
        .then((resolve) => {
          expect(resolve).toEqual(true);
          csvHelpers.cleanupTmpPath(bogusFilesInCheckDataPath);
        })
        .catch(err => {
          expect(err).toEqual('');
          csvHelpers.cleanupTmpPath(bogusFilesInCheckDataPath);
        });
    });

    test('should resolve true for projectOpenedAutographa', () => {
      const translate = (key) => key;
      return csvExportActions.saveAllCSVData(projectOpenedAutographa, translate)
        .then((resolve) => {
          expect(resolve).toEqual(true);
          csvHelpers.cleanupTmpPath(projectOpenedAutographa);
        })
        .catch(err => {
          expect(err).toEqual('');
          csvHelpers.cleanupTmpPath(projectOpenedAutographa);
        });
    });
  });

  describe('csvExportActions.exportToCSVZip', () => {
    test('should resolve true for checksPerformedPath', async () => {
      const testFolder = path.join(testOutputPath, '1'); // make unique test folder
      fs.ensureDirSync(testFolder);
      const zipPath = path.join(testFolder, 'export.zip');
      expect.assertions(1);
      try {
        const translate = (key) => key;
        const resolve = await csvExportActions.exportToCSVZip(checksPerformedPath, zipPath, translate);
        if (fs.existsSync(testFolder)) {
          fs.removeSync(testFolder);
        }
        expect(resolve).toEqual(true);
      } catch (err) {
        expect(err).toEqual('');
      }
    });

    test('should resolve true for noChecksPerformedPath', async () => {
      const testFolder = path.join(testOutputPath, '2'); // make unique test folder
      fs.ensureDirSync(testFolder);
      const zipPath = path.join(testFolder, 'export.zip');
      expect.assertions(1);
      try {
        const translate = (key) => key;
        const resolve = await csvExportActions.exportToCSVZip(noChecksPerformedPath, zipPath, translate);
        if (fs.existsSync(testFolder)) {
          fs.removeSync(testFolder);
        }
        expect(resolve).toEqual(true);
      } catch (err) {
        expect(err).toEqual('');
      }
    });

    test('should resolve true for bogusFilesInCheckDataPath', async () => {
      const testFolder = path.join(testOutputPath, '3'); // make unique test folder
      fs.ensureDirSync(testFolder);
      const zipPath = path.join(testFolder, 'export.zip');
      expect.assertions(1);
      try {
        const translate = (key) => key;
        const resolve = await csvExportActions.exportToCSVZip(bogusFilesInCheckDataPath, zipPath, translate);
        if (fs.existsSync(testFolder)) {
          fs.removeSync(testFolder);
        }
        expect(resolve).toEqual(true);
      } catch (err) {
        expect(err).toEqual('');
      }
    });
  });

  describe('csvExportActions.exportToCSV', () => {
    let store;
    beforeEach(() => {
      // create a new store instance for each test
      store = createStore(
        reducers,
        applyMiddleware(thunk)
      );
    });
    test('should fail to export a project that has merge conflicts', () => {
      let projectPath = path.join(__dirname,
        'fixtures/project/mergeConflicts/two_merge_conflicts_project');
      let spy_cancel_stepper = jest.spyOn(ProjectImportStepperActions,
        'cancelProjectValidationStepper');
      let spy_open_dialog = jest.spyOn(AlertModalActions, 'openAlertDialog');
      store.dispatch(csvExportActions.exportToCSV(projectPath));
      expect(spy_cancel_stepper).toHaveBeenCalled();
      expect(spy_open_dialog).toBeCalledWith('projects.merge_export_error');
    });
  });

});
