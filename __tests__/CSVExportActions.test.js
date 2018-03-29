/* eslint-env jest */
/* eslint-disable no-console */
jest.unmock('fs-extra');
jest.unmock('adm-zip');
import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import reducers from '../src/js/reducers';
import fs from 'fs-extra';
import path from 'path-extra';
// actions
import * as csvExportActions from '../src/js/actions/CSVExportActions';
import * as ProjectImportStepperActions from '../src/js/actions/ProjectImportStepperActions';
import * as AlertModalActions from '../src/js/actions/AlertModalActions';
// helpers
import * as csvHelpers from '../src/js/helpers/csvHelpers';

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
const noChecksPerformedPath = path.join('__tests__/fixtures/project/csv/no_checks_performed/fr_eph_text_ulb');
const checksPerformedPath = path.join('__tests__/fixtures/project/csv/checks_performed/fr_eph_text_ulb');
const bogusFilesInCheckDataPath = path.join('__tests__/fixtures/project/csv/bogus_files/abu_tit_text_reg');
const projectOpenedAutographa = path.join('__tests__/fixtures/project/csv/project_opened_autographa/ar_eph_text_ulb');
const testOutputPath = path.join('__tests__/output');

describe('csvExportActions.saveToolDataToCSV', () => {
    test('should resolve true for checksPerformedPath', () => {
        return csvExportActions.saveToolDataToCSV('translationWords', checksPerformedPath)
            .then((value) => {
        expect(value).toEqual(true);
        csvHelpers.cleanupTmpPath(checksPerformedPath);
            })
            .catch(err => {
        console.log(err);
        expect(err).toEqual('');
        const dataPath = csvHelpers.dataPath(checksPerformedPath);
        const filePath = path.join(dataPath, 'output', 'translationWords_CheckData.csv');
        expect(fs.existsSync(filePath)).toEqual(true);
        csvHelpers.cleanupTmpPath(checksPerformedPath);
            });
    });

    test('should resolve true for bogusFilesInCheckDataPath', () => {
        return csvExportActions.saveToolDataToCSV('translationWords', bogusFilesInCheckDataPath)
            .then((resolve) => {
        expect(resolve).toEqual(true);
        csvHelpers.cleanupTmpPath('translationWords', bogusFilesInCheckDataPath);
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
        return csvExportActions.saveVerseEditsToCSV(checksPerformedPath)
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
        return csvExportActions.saveVerseEditsToCSV(bogusFilesInCheckDataPath)
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
        return csvExportActions.saveCommentsToCSV(checksPerformedPath)
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
        return csvExportActions.saveCommentsToCSV(bogusFilesInCheckDataPath)
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
        return csvExportActions.saveSelectionsToCSV(checksPerformedPath)
            .then((value) => {
                expect(value).toEqual(true);
                const dataPath = csvHelpers.dataPath(checksPerformedPath);
                const filePath = path.join(dataPath, 'output', 'Selections.csv');
                expect(fs.existsSync(filePath)).toEqual(true);
                csvHelpers.cleanupTmpPath(checksPerformedPath);
            })
            .catch(err => {
                expect(err).toEqual('');
                csvHelpers.cleanupTmpPath(checksPerformedPath);
            });
    });

    test('should resolve true for bogusFilesInCheckDataPath', () => {
        return csvExportActions.saveSelectionsToCSV(bogusFilesInCheckDataPath)
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
        return csvExportActions.saveRemindersToCSV(checksPerformedPath)
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
        return csvExportActions.saveRemindersToCSV(bogusFilesInCheckDataPath)
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
        return csvExportActions.saveAllCSVData(checksPerformedPath)
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
        return csvExportActions.saveAllCSVData(noChecksPerformedPath)
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
        return csvExportActions.saveAllCSVData(bogusFilesInCheckDataPath)
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
        return csvExportActions.saveAllCSVData(projectOpenedAutographa)
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
    test('should resolve true for checksPerformedPath', () => {
        const zipPath = path.join(testOutputPath, 'export.zip');
        return csvExportActions.exportToCSVZip(checksPerformedPath, zipPath)
            .then((resolve) => {
        expect(resolve).toEqual(true);
        if (fs.existsSync(zipPath)) {
          fs.removeSync(zipPath);
        }
            })
            .catch(err => {
          expect(err).toEqual('');
        });
    });

    test('should resolve true for noChecksPerformedPath', () => {
        const zipPath = path.join(testOutputPath, 'export.zip');
        return csvExportActions.exportToCSVZip(noChecksPerformedPath, zipPath)
            .then((resolve) => {
        expect(resolve).toEqual(true);
        if (fs.existsSync(zipPath)) {
            fs.removeSync(zipPath);
        }
            })
            .catch(err => {
          expect(err).toEqual('');
        });
    });

    test('should resolve true for bogusFilesInCheckDataPath', () => {
        const zipPath = path.join(testOutputPath, 'export.zip');
        return csvExportActions.exportToCSVZip(bogusFilesInCheckDataPath, zipPath)
            .then((resolve) => {
        expect(resolve).toEqual(true);
        if (fs.existsSync(zipPath)) {
            fs.removeSync(zipPath);
        }
            })
            .catch(err => {
                expect(err).toEqual('');
            });
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
        let projectPath = path.join(__dirname, './fixtures/project/mergeConflicts/two_merge_conflicts_project');
        let spy_cancel_stepper = jest.spyOn(ProjectImportStepperActions, 'cancelProjectValidationStepper');
        let spy_open_dialog = jest.spyOn(AlertModalActions, 'openAlertDialog');
        store.dispatch(csvExportActions.exportToCSV(projectPath));
        expect(spy_cancel_stepper).toHaveBeenCalled();
        expect(spy_open_dialog).toBeCalledWith('projects.merge_export_error');
    });
});
