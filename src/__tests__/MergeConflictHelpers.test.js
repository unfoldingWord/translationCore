/* eslint-env jest */
import fs from 'fs-extra';
import path from 'path-extra';
//helpers
import * as MergeConflictHelpers from '../js/helpers/ProjectValidation/MergeConflictHelpers';
import * as ProjectStructureValidationHelpers from '../js/helpers/ProjectValidation/ProjectStructureValidationHelpers';
jest.unmock('fs-extra');
//projects
const noMergeConflictsProjectPath = path.join(__dirname, 'fixtures/project/mergeConflicts/no_merge_conflicts_project');
const oneMergeConflictsProjectPath = path.join(__dirname, 'fixtures/project/mergeConflicts/one_merge_conflict_project');
const manyMergeConflictsUSFMPath = path.join(__dirname, 'fixtures/project/mergeConflicts/many_merge_conflicts_usfm');
const noMergeConflictsUSFMPath = path.join(__dirname, 'fixtures/project/mergeConflicts/no_merge_conflicts_usfm');
const oneMergeConflictsUSFMPath = path.join(__dirname, 'fixtures/project/mergeConflicts/one_merge_conflict_usfm');
const twoMergeConflictsUSFMPath = path.join(__dirname, 'fixtures/project/mergeConflicts/two_merge_conflicts_usfm');
const unResolveableConflictProjectPath = path.join(__dirname, 'fixtures/project/mergeConflicts/unresolveable_conflict_project');

const twoMergeConflictsObject = [[{
  'chapter': '2', 'verses': '1', 'text': { '1': ['Some random verse with a merge conflict'] }, 'checked': true,
}, {
  'chapter': '2', 'verses': '1', 'text': { '1': ['Another random verse with a merge conflict'] }, 'checked': false,
}], [{
  'chapter': '2', 'verses': '6-8', 'text': {
    '6': ['Ta haka kuma, ka karfafa samari, su zama masu hankali.'], '7': ['A kowanne fanni, ka mayar da kan ka abin koyi a cikin kyawawan ayyuka; idan kayi koyarwa, ka nuna mutunci da martaba.'], '8': ['Ka bada sako lafiyayye marar abin zargi, yadda masu hamayya da maganar Allah zasu ji kunya, domin rashin samun mugun abin fadi akan mu.'],
  }, 'checked': false,
}, {
  'chapter': '2', 'verses': '6-8', 'text': {
    '6': ['Also detecting multiple verses with merge conflicts'], '7': ['This is a translation correction'], '8': ['Another random version with some changes'],
  }, 'checked': true,
}]];
const oneMergeConflictsObject = [[{
  'chapter':'1','verses':'8','text':{ '8':['This is random verse with a merge conflict'] },'checked':true,
},{
  'chapter':'1','verses':'8','text':{ '8':['This is a another random verse with a merge conlfict'] },'checked':false,
}]];

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
    let usfmFilePath = ProjectStructureValidationHelpers.isUSFMProject(oneMergeConflictsUSFMPath);
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
    let usfmFilePath = ProjectStructureValidationHelpers.isUSFMProject(oneMergeConflictsUSFMPath);
    let hasMergeConflicts = MergeConflictHelpers.checkUSFMForMergeConflicts(usfmFilePath);
    expect(hasMergeConflicts).toBeTruthy();
  });

  test('should detect no merge conflicts in a usfm file', () => {
    let usfmFilePath = ProjectStructureValidationHelpers.isUSFMProject(noMergeConflictsUSFMPath);
    let hasMergeConflicts = MergeConflictHelpers.checkUSFMForMergeConflicts(usfmFilePath);
    expect(hasMergeConflicts).toBeFalsy();
  });
});

describe('MergeConflictHelpers.merge', () => {
  const projectSaveLocation = path.join(__dirname, 'output/tests/projects');

  beforeEach(() => {
    fs.ensureDirSync(projectSaveLocation);
  });

  afterEach(() => {
    fs.removeSync(projectSaveLocation);
  });

  test('should successfully merge a seleceted merge conflict', () => {
    let inputFile = oneMergeConflictsUSFMPath + '/php.usfm';
    let outputFile = oneMergeConflictsUSFMPath + '/php-merged.usfm';
    let hasMergeConflicts = MergeConflictHelpers.checkUSFMForMergeConflicts(inputFile);
    expect(hasMergeConflicts).toBeTruthy();
    MergeConflictHelpers.merge(oneMergeConflictsObject, inputFile, outputFile);
    expect(fs.readFileSync(outputFile).toString()).toBeTruthy();
    hasMergeConflicts = MergeConflictHelpers.checkUSFMForMergeConflicts(outputFile);
    expect(hasMergeConflicts).toBeFalsy();
    fs.removeSync(outputFile);
  });

  test('should successfully merge two seleceted merge conflicts', () => {
    let inputFile = path.join(twoMergeConflictsUSFMPath, 'tit.usfm');
    let outputFile = path.join(twoMergeConflictsUSFMPath, 'tit-merged.usfm');
    let hasMergeConflicts = MergeConflictHelpers.checkUSFMForMergeConflicts(inputFile);
    expect(hasMergeConflicts).toBeTruthy();
    MergeConflictHelpers.merge(twoMergeConflictsObject, inputFile, outputFile);
    expect(fs.readFileSync(outputFile).toString()).toBeTruthy();
    hasMergeConflicts = MergeConflictHelpers.checkUSFMForMergeConflicts(outputFile);
    expect(hasMergeConflicts).toBeFalsy();
    fs.removeSync(outputFile);
  });
});

describe('MergeConflictHelpers.getMergeConflicts', () => {
  test('should successfully find a merge conflict', () => {
    let usfmFilePath = ProjectStructureValidationHelpers.isUSFMProject(oneMergeConflictsUSFMPath);
    let usfmData = MergeConflictHelpers.loadUSFM(usfmFilePath);
    let foundMergeConflicts = MergeConflictHelpers.getMergeConflicts(usfmData);
    expect(foundMergeConflicts.length).toEqual(2);
  });

  test('should successfully find two merge conflicts', () => {
    let usfmFilePath = ProjectStructureValidationHelpers.isUSFMProject(twoMergeConflictsUSFMPath);
    let usfmData = MergeConflictHelpers.loadUSFM(usfmFilePath);
    let foundMergeConflicts = MergeConflictHelpers.getMergeConflicts(usfmData);
    expect(foundMergeConflicts.length).toEqual(4);
  });

  test('should successfully find many merge conflicts', () => {
    let usfmFilePath = ProjectStructureValidationHelpers.isUSFMProject(manyMergeConflictsUSFMPath);
    let usfmData = MergeConflictHelpers.loadUSFM(usfmFilePath);
    let foundMergeConflicts = MergeConflictHelpers.getMergeConflicts(usfmData);
    expect(foundMergeConflicts.length).toEqual(10);
  });
});

describe('MergeConflictHelpers.parseMergeConflictVersion', () => {
  test('should parse the version of a merge conflict in the format of the reducer', () => {
    const verseText = 'This is random verse with a merge conflict';
    const expectedParsedObject = {
      'chapter': '1', 'text': { '8': verseText }, 'verses': '8',
    };
    const versionText = `\\v 8 ${verseText}`;
    let usfmFilePath = ProjectStructureValidationHelpers.isUSFMProject(oneMergeConflictsUSFMPath);
    let usfmData = MergeConflictHelpers.loadUSFM(usfmFilePath);
    const parsedMergeConflict = MergeConflictHelpers.parseMergeConflictVersion(versionText, usfmData);
    expect(parsedMergeConflict).toEqual(expectedParsedObject);
  });

  test('should parse the version of a merge conflict with two verses in the format of the reducer', () => {
    const verseText1 = 'El anciano debe ser irreprensible, esposo de una sola mujer, con hijos fieles, que no sean acusados de ser malos o indisciplinados.';
    const verseText2 = 'Es necesario que el obispo, como administrador de la casa de Dios, sea irreprensible. No debe ser escandaloso o desenfrenado. No se debe enojar fácilmente, ni ser adicto al vino, no violento, ni avaro.';
    const expectedParsedObject = {
      'chapter': '1',
      'text': {
        '6': 'El anciano debe ser irreprensible, esposo de una sola mujer, con hijos fieles, que no sean acusados de ser malos o indisciplinados. ',
        '7': 'Es necesario que el obispo, como administrador de la casa de Dios, sea irreprensible. No debe ser escandaloso o desenfrenado. No se debe enojar fácilmente, ni ser adicto al vino, no violento, ni avaro.',
      },
      'verses': '6-7',
    };
    const versionText = `\\v 6 ${verseText1} \\v 7 ${verseText2}`;
    let usfmFilePath = ProjectStructureValidationHelpers.isUSFMProject(manyMergeConflictsUSFMPath);
    let usfmData = MergeConflictHelpers.loadUSFM(usfmFilePath);
    const parsedMergeConflict = MergeConflictHelpers.parseMergeConflictVersion(versionText, usfmData);
    expect(parsedMergeConflict).toEqual(expectedParsedObject);
  });
});

describe('MergeConflictHelpers.getChapterFromVerseText', () => {
  test('should fine the chapter from which the verse is from', () => {
    const verseText = 'Aka mien ọnọ mọn adiuduan oghi efunru, imọin lẹ ọnuan ni.';
    const expectedChapter = '3';
    let usfmFilePath = ProjectStructureValidationHelpers.isUSFMProject(oneMergeConflictsUSFMPath);
    let usfmData = MergeConflictHelpers.loadUSFM(usfmFilePath);
    const parsedMergeConflict = MergeConflictHelpers.getChapterFromVerseText(verseText, usfmData);
    expect(parsedMergeConflict).toEqual(expectedChapter);
  });

  test('should not find the chapter from which the verse is from', () => {
    const verseText = 'verse that doesnt exist';
    let usfmFilePath = ProjectStructureValidationHelpers.isUSFMProject(oneMergeConflictsUSFMPath);
    let usfmData = MergeConflictHelpers.loadUSFM(usfmFilePath);
    const parsedMergeConflict = MergeConflictHelpers.getChapterFromVerseText(verseText, usfmData);
    expect(parsedMergeConflict).toBeUndefined();
  });
});
