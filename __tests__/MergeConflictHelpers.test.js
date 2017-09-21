/* eslint-env jest */


import fs from 'fs-extra';
//helpers
import * as MergeConflictHelpers from '../src/js/helpers/MergeConflictHelpers';
import * as USFMHelpers from '../src/js/helpers/usfmHelpers';
//projects
const noMergeConflictsProjectPath = '__tests__/fixtures/project/mergeConflicts/no_merge_conflicts_project';
const oneMergeConflictsProjectPath = '__tests__/fixtures/project/mergeConflicts/one_merge_conflict_project';
const twoMergeConflictsProjectPath = '__tests__/fixtures/project/mergeConflicts/two_merge_conflicts_project';
const manyMergeConflictsUSFMPath = '__tests__/fixtures/project/mergeConflicts/many_merge_conflicts_usfm';
const noMergeConflictsUSFMPath = '__tests__/fixtures/project/mergeConflicts/no_merge_conflicts_usfm';
const oneMergeConflictsUSFMPath = '__tests__/fixtures/project/mergeConflicts/one_merge_conflict_usfm';
const twoMergeConflictsUSFMPath = '__tests__/fixtures/project/mergeConflicts/two_merge_conflicts_usfm';
const unResolveableConflictProjectPath = '__tests__/fixtures/project/mergeConflicts/unresolveable_conflict_project';

const oneMergeConflictArray = [
  {
    "chapter": "1",
    "verses": "8",
    "text": {
      "8": "This is random verse with a merge conflict"
    },
    "checked": true
  },
  {
    "chapter": "1",
    "verses": "8",
    "text": {
      "8": "This is a another random verse with a merge conlfict"
    },
    "checked": false
  }
];

describe('MergeConflictHelpers.projectHasMergeConflicts', () => {
  test('should not detect merge conflicts in a pre-imported tC project', () => {
    let projectHasMergeConflicts = MergeConflictHelpers.projectHasMergeConflicts(oneMergeConflictsProjectPath, 'php');
    expect(projectHasMergeConflicts).toBeFalsy();
  });

  test('should detect merge conflicts in a tC project that was imported without conflicts being resolved', () => {
    let projectHasMergeConflicts = MergeConflictHelpers.projectHasMergeConflicts(unResolveableConflictProjectPath, 'php');
    expect(projectHasMergeConflicts).toBeTruthy();
  });
});

describe('MergeConflictHelpers.createUSFMFromTsProject', () => {
  test('should create a valid usfm from a tS project', () => {
    let usfmData = MergeConflictHelpers.createUSFMFromTsProject(noMergeConflictsProjectPath);
    expect(typeof usfmData).toEqual('string');
    expect(usfmData.split('\\c').length).toEqual(4);
    expect(usfmData.split('\\p').length).toEqual(4);
    expect(usfmData.split('\\v').length).toEqual(47);
  });

  test('should detect a merge conflict in a tS converted project', () => {
    let usfmFilePath = USFMHelpers.isUSFMProject(oneMergeConflictsUSFMPath);
    let usfmData = MergeConflictHelpers.createUSFMFromTsProject(oneMergeConflictsProjectPath);
    MergeConflictHelpers.writeUSFM(usfmFilePath, usfmData);
    expect(typeof usfmData).toEqual('string');
    expect(usfmData.split('\\c').length).toEqual(5);
    expect(usfmData.split('\\p').length).toEqual(5);
    expect(usfmData.split('\\v').length).toEqual(105);
    let usfmHasMergeConflicts = MergeConflictHelpers.checkUSFMForMergeConflicts(usfmFilePath);
    expect(usfmHasMergeConflicts).toBeTruthy();
  });
});

describe('MergeConflictHelpers.checkUSFMForMergeConflicts', () => {
  test('should detect a merge conflict in a usfm file', () => {
    let usfmFilePath = USFMHelpers.isUSFMProject(oneMergeConflictsUSFMPath);
    let hasMergeConflicts = MergeConflictHelpers.checkUSFMForMergeConflicts(usfmFilePath);
    expect(hasMergeConflicts).toBeTruthy();
  });

  test('should detect no merge conflicts in a usfm file', () => {
    let usfmFilePath = USFMHelpers.isUSFMProject(noMergeConflictsUSFMPath);
    let hasMergeConflicts = MergeConflictHelpers.checkUSFMForMergeConflicts(usfmFilePath);
    expect(hasMergeConflicts).toBeFalsy();
  });
});

describe('MergeConflictHelpers.merge', () => {
  test('should successfully merge a seleceted merge conflict', () => {
    let inputFile =  oneMergeConflictsUSFMPath + '/php.usfm';
    let outputFile =  oneMergeConflictsUSFMPath + '/php-merged.usfm'
    let hasMergeConflicts = MergeConflictHelpers.checkUSFMForMergeConflicts(inputFile);
    expect(hasMergeConflicts).toBeTruthy();
    MergeConflictHelpers.merge(oneMergeConflictArray, inputFile, outputFile);
    hasMergeConflicts = MergeConflictHelpers.checkUSFMForMergeConflicts(outputFile);
    expect(hasMergeConflicts).toBeFalsy();
    fs.removeSync(outputFile);
  });

  test('should successfully merge two seleceted merge conflicts', () => {
    let inputFile =  twoMergeConflictsUSFMPath + '/tit.usfm';
    let outputFile =  twoMergeConflictsUSFMPath + '/tit-merged.usfm'
    let hasMergeConflicts = MergeConflictHelpers.checkUSFMForMergeConflicts(inputFile);
    expect(hasMergeConflicts).toBeTruthy();
    MergeConflictHelpers.merge(oneMergeConflictArray, inputFile, outputFile);
    hasMergeConflicts = MergeConflictHelpers.checkUSFMForMergeConflicts(outputFile);
    expect(hasMergeConflicts).toBeFalsy();
    fs.removeSync(outputFile);
  })
});

describe('MergeConflictHelpers.getMergeConflicts', () => {
  test('should successfully find a merge conflict', () => {
    let usfmFilePath = USFMHelpers.isUSFMProject(oneMergeConflictsUSFMPath);
    let usfmData = MergeConflictHelpers.loadUSFM(usfmFilePath);
    let foundMergeConflicts = MergeConflictHelpers.getMergeConflicts(usfmData);
    expect(foundMergeConflicts.length).toEqual(2);
  });

  test('should successfully find two merge conflicts', () => {
    let usfmFilePath = USFMHelpers.isUSFMProject(twoMergeConflictsUSFMPath);
    let usfmData = MergeConflictHelpers.loadUSFM(usfmFilePath);
    let foundMergeConflicts = MergeConflictHelpers.getMergeConflicts(usfmData);
    expect(foundMergeConflicts.length).toEqual(4);
  });

  test('should successfully find many merge conflicts', () => {
    let usfmFilePath = USFMHelpers.isUSFMProject(manyMergeConflictsUSFMPath);
    let usfmData = MergeConflictHelpers.loadUSFM(usfmFilePath);
    let foundMergeConflicts = MergeConflictHelpers.getMergeConflicts(usfmData);
    expect(foundMergeConflicts.length).toEqual(10);
  })
});