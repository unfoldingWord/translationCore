/* eslint-disable no-console */
import {describe, it} from 'mocha';
import { expect } from 'chai';
import fs from 'fs-extra';
import path from 'path-extra';
// actions
import * as csvExportActions from '../src/js/actions/CSVExportActions';
// helpers
import * as csvHelpers from '../src/js/helpers/csvHelpers';

// data
const noChecksPerformedPath = path.join(window.__base, 'test/fixtures/projects/csv/no_checks_performed/fr_eph_text_ulb');
const checksPerformedPath = path.join(window.__base, 'test/fixtures/projects/csv/checks_performed/fr_eph_text_ulb');
const bogusFilesInCheckDataPath = path.join(window.__base, 'test/fixtures/projects/csv/bogus_files/abu_tit_text_reg');
const testOutputPath = path.join(window.__base, 'test/output');

describe('csvExportActions.saveToolDataToCSV', () => {
  it('should resolve true for checksPerformedPath', function (done) {
    csvExportActions.saveToolDataToCSV('translationWords', checksPerformedPath)
    .then( (value) => {
      expect(value).to.equal(true);
      csvHelpers.cleanupTmpPath(checksPerformedPath);
      done();
    })
    .catch( err => {
      console.log(err);
      expect(err).to.equal('');
      const dataPath = csvHelpers.dataPath(checksPerformedPath);
      const filePath = path.join(dataPath, 'output', 'translationWords_CheckData.csv');
      expect(fs.existsSync(filePath)).to.equal(true);
      csvHelpers.cleanupTmpPath(checksPerformedPath);
      done();
    });
  });
  it('should resolve true for bogusFilesInCheckDataPath', function (done) {
    csvExportActions.saveToolDataToCSV('translationWords', bogusFilesInCheckDataPath)
    .then( (resolve) => {
      expect(resolve).to.equal(true);
      csvHelpers.cleanupTmpPath('translationWords', bogusFilesInCheckDataPath);
      done();
    })
    .catch( err => {
      console.log(err);
      expect(err).to.equal('');
      csvHelpers.cleanupTmpPath(bogusFilesInCheckDataPath);
      done();
    });
  });
});

describe('csvExportActions.saveVerseEditsToCSV', () => {
  it('should resolve true for checksPerformedPath', function (done) {
    csvExportActions.saveVerseEditsToCSV(checksPerformedPath)
    .then( (value) => {
      expect(value).to.equal(true);
      const dataPath = csvHelpers.dataPath(checksPerformedPath);
      const filePath = path.join(dataPath, 'output', 'VerseEdits.csv');
      expect(fs.existsSync(filePath)).to.equal(true);
      csvHelpers.cleanupTmpPath(checksPerformedPath);
      done();
    })
    .catch( err => {
      console.log(err);
      expect(err).to.equal('');
      csvHelpers.cleanupTmpPath(checksPerformedPath);
      done();
    });
  });
  it('should resolve true for bogusFilesInCheckDataPath', function (done) {
    csvExportActions.saveVerseEditsToCSV(bogusFilesInCheckDataPath)
    .then( (value) => {
      expect(value).to.equal(true);
      const dataPath = csvHelpers.dataPath(bogusFilesInCheckDataPath);
      const filePath = path.join(dataPath, 'output', 'VerseEdits.csv');
      expect(fs.existsSync(filePath)).to.equal(true);
      csvHelpers.cleanupTmpPath(bogusFilesInCheckDataPath);
      done();
    })
    .catch( err => {
      console.log(err);
      expect(err).to.equal('');
      csvHelpers.cleanupTmpPath(bogusFilesInCheckDataPath);
      done();
    });
  });
});

describe('csvExportActions.saveCommentsToCSV', () => {
  it('should resolve true for checksPerformedPath', function (done) {
    csvExportActions.saveCommentsToCSV(checksPerformedPath)
    .then( (value) => {
      expect(value).to.equal(true);
      const dataPath = csvHelpers.dataPath(checksPerformedPath);
      const filePath = path.join(dataPath, 'output', 'Comments.csv');
      expect(fs.existsSync(filePath)).to.equal(true);
      csvHelpers.cleanupTmpPath(checksPerformedPath);
      done();
    })
    .catch( err => {
      console.log(err);
      expect(err).to.equal('');
      csvHelpers.cleanupTmpPath(checksPerformedPath);
      done();
    });
  });
  it('should resolve true for bogusFilesInCheckDataPath', function (done) {
    csvExportActions.saveCommentsToCSV(bogusFilesInCheckDataPath)
    .then( (value) => {
      expect(value).to.equal(true);
      const dataPath = csvHelpers.dataPath(bogusFilesInCheckDataPath);
      const filePath = path.join(dataPath, 'output', 'Comments.csv');
      expect(fs.existsSync(filePath)).to.equal(true);
      csvHelpers.cleanupTmpPath(bogusFilesInCheckDataPath);
      done();
    })
    .catch( err => {
      console.log(err);
      expect(err).to.equal('');
      csvHelpers.cleanupTmpPath(bogusFilesInCheckDataPath);
      done();
    });
  });
});

describe('csvExportActions.saveSelectionsToCSV', () => {
  it('should resolve true for checksPerformedPath', function (done) {
    csvExportActions.saveSelectionsToCSV(checksPerformedPath)
    .then( (value) => {
      expect(value).to.equal(true);
      const dataPath = csvHelpers.dataPath(checksPerformedPath);
      const filePath = path.join(dataPath, 'output', 'Selections.csv');
      expect(fs.existsSync(filePath)).to.equal(true);
      csvHelpers.cleanupTmpPath(checksPerformedPath);
      done();
    })
    .catch( err => {
      console.log(err);
      expect(err).to.equal('');
      csvHelpers.cleanupTmpPath(checksPerformedPath);
      done();
    });
  });
  it('should resolve true for bogusFilesInCheckDataPath', function (done) {
    csvExportActions.saveSelectionsToCSV(bogusFilesInCheckDataPath)
    .then( (value) => {
      expect(value).to.equal(true);
      const dataPath = csvHelpers.dataPath(bogusFilesInCheckDataPath);
      const filePath = path.join(dataPath, 'output', 'Selections.csv');
      expect(fs.existsSync(filePath)).to.equal(true);
      csvHelpers.cleanupTmpPath(bogusFilesInCheckDataPath);
      done();
    })
    .catch( err => {
      console.log(err);
      expect(err).to.equal('');
      csvHelpers.cleanupTmpPath(bogusFilesInCheckDataPath);
      done();
    });
  });
});

describe('csvExportActions.saveRemindersToCSV', () => {
  it('should resolve true', function (done) {
    csvExportActions.saveRemindersToCSV(checksPerformedPath)
    .then( (value) => {
      expect(value).to.equal(true);
      const dataPath = csvHelpers.dataPath(checksPerformedPath);
      const filePath = path.join(dataPath, 'output', 'Reminders.csv');
      expect(fs.existsSync(filePath)).to.equal(true);
      csvHelpers.cleanupTmpPath(checksPerformedPath);
      done();
    })
    .catch( err => {
      console.log(err);
      expect(err).to.equal('');
      csvHelpers.cleanupTmpPath(checksPerformedPath);
      done();
    });
  });
  it('should resolve true for bogusFilesInCheckDataPath', function (done) {
    csvExportActions.saveRemindersToCSV(bogusFilesInCheckDataPath)
    .then( (value) => {
      expect(value).to.equal(true);
      const dataPath = csvHelpers.dataPath(bogusFilesInCheckDataPath);
      const filePath = path.join(dataPath, 'output', 'Reminders.csv');
      expect(fs.existsSync(filePath)).to.equal(true);
      csvHelpers.cleanupTmpPath(bogusFilesInCheckDataPath);
      done();
    })
    .catch( err => {
      console.log(err);
      expect(err).to.equal('');
      csvHelpers.cleanupTmpPath(bogusFilesInCheckDataPath);
      done();
    });
  });
});

describe('csvExportActions.saveAllCSVData', () => {
  it('should resolve true for checksPerformedPath', function (done) {
    csvExportActions.saveAllCSVData(checksPerformedPath)
    .then( (resolve) => {
      expect(resolve).to.equal(true);
      csvHelpers.cleanupTmpPath(checksPerformedPath);
      done();
    })
    .catch( err => {
      console.log(err);
      expect(err).to.equal('');
      csvHelpers.cleanupTmpPath(checksPerformedPath);
      done();
    });
  });
  it('should resolve true for noChecksPerformedPath', function (done) {
    csvExportActions.saveAllCSVData(noChecksPerformedPath)
    .then( (resolve) => {
      expect(resolve).to.equal(true);
      csvHelpers.cleanupTmpPath(noChecksPerformedPath);
      done();
    })
    .catch( err => {
      console.log(err);
      expect(err).to.equal('');
      csvHelpers.cleanupTmpPath(noChecksPerformedPath);
      done();
    });
  });
  it('should resolve true for bogusFilesInCheckDataPath', function (done) {
    csvExportActions.saveAllCSVData(bogusFilesInCheckDataPath)
    .then( (resolve) => {
      expect(resolve).to.equal(true);
      csvHelpers.cleanupTmpPath(bogusFilesInCheckDataPath);
      done();
    })
    .catch( err => {
      console.log(err);
      expect(err).to.equal('');
      csvHelpers.cleanupTmpPath(bogusFilesInCheckDataPath);
      done();
    });
  });
});

describe('csvExportActions.exportToCSVZip', () => {
  it('should resolve true for checksPerformedPath', function (done) {
    const zipPath = path.join(testOutputPath, 'export.zip')
    csvExportActions.exportToCSVZip(checksPerformedPath, zipPath)
    .then( (resolve) => {
      expect(resolve).to.equal(true);
      try {
        fs.removeSync(zipPath);
      } catch (err) {
        console.log(err)
      }
      done();
    })
    .catch( err => {
      console.log(err);
      expect(err).to.equal('');
      done();
    });
  });
  it('should resolve true for noChecksPerformedPath', function (done) {
    const zipPath = path.join(testOutputPath, 'export.zip')
    csvExportActions.exportToCSVZip(noChecksPerformedPath, zipPath)
    .then( (resolve) => {
      expect(resolve).to.equal(true);
      try {
        fs.removeSync(zipPath);
      } catch (err) {
        console.log(err)
      }
      done();
    })
    .catch( err => {
      console.log(err);
      expect(err).to.equal('');
      done();
    });
  });
  it('should resolve true for bogusFilesInCheckDataPath', function (done) {
    const zipPath = path.join(testOutputPath, 'export.zip')
    csvExportActions.exportToCSVZip(bogusFilesInCheckDataPath, zipPath)
    .then( (resolve) => {
      expect(resolve).to.equal(true);
      try {
        fs.removeSync(zipPath);
      } catch (err) {
        console.log(err)
      }
      done();
    })
    .catch( err => {
      console.log(err);
      expect(err).to.equal('');
      done();
    });
  });
});
