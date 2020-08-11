import fs from 'fs-extra';
import path from 'path-extra';
import _ from 'lodash';
import semver from 'semver';
// helpers
import * as ProjectStructureValidationHelpers from '../js/helpers/ProjectValidation/ProjectStructureValidationHelpers';
import * as manifestUtils from '../js/helpers/ProjectMigration/manifestUtils';
import {
  APP_VERSION,
  tc_MIN_VERSION_ERROR,
  tc_EDIT_VERSION_KEY,
  tc_MIN_COMPATIBLE_VERSION_KEY,
  PROJECTS_PATH,
} from '../js/common/constants';
// projects
const obs_project_1 = path.join(__dirname, 'fixtures/project/projectVerification/obs_project_1');
const obs_project_2 = path.join(__dirname, 'fixtures/project/projectVerification/obs_project_2');
const multibook_project_1 = path.join(__dirname, 'fixtures/project/projectVerification/multibook_project_1');
const multibook_project_2 = path.join(__dirname, 'fixtures/project/projectVerification/multibook_project_2');
const singlebook_project = path.join(__dirname, 'fixtures/project/projectVerification/singlebook_project');
const dupbooks_project = path.join(__dirname, 'fixtures/project/projectVerification/duplicate_books');
const invalidbook_project = path.join(__dirname, 'fixtures/project/projectVerification/invalid_books');
const nobooks_project = path.join(__dirname, 'fixtures/project/projectVerification/no_books');
const en_ta_project = path.join(__dirname, 'fixtures/project/projectVerification/en_ta');
const en_tw_project = path.join(__dirname, 'fixtures/project/projectVerification/en_tw');
const en_tn_project = path.join(__dirname, 'fixtures/project/projectVerification/en_tn');

describe('ProjectStructureValidationHelpers.ensureSupportedVersion', () => {
  const projectName = 'en_tit';
  const translate = (t) => t;
  const expectedRejection = 'project_validation.old_project_unsupported';

  beforeEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
    fs.__setMockFS({}); // initialize to empty
    const sourcePath = path.join(__dirname, 'fixtures/project');
    let copyFiles = [projectName];
    fs.__loadFilesIntoMockFs(copyFiles, sourcePath, PROJECTS_PATH);
  });
  afterEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
  });
  test('should allow import of 0.8.1 project with checking', () => {
    const projectPath = path.join(PROJECTS_PATH, projectName);
    return expect(ProjectStructureValidationHelpers.isProjectSupported(projectPath, translate)).resolves.toEqual(true);
  });
  test('should allow import of 0.8.0 project with checking', () => {
    const projectPath = path.join(PROJECTS_PATH, projectName);
    makeProject_0_8_0(projectPath);
    return expect(ProjectStructureValidationHelpers.isProjectSupported(projectPath, translate)).resolves.toEqual(true);
  });
  test('should not allow import of 0.7.0 project with checking', () => {
    const projectPath = path.join(PROJECTS_PATH, projectName);
    makeProject_0_7_0(projectPath);
    return expect(ProjectStructureValidationHelpers.isProjectSupported(projectPath, translate)).rejects.toEqual(expectedRejection);
  });
  test('should allow import of 0.7.0 project without checking', () => {
    const projectPath = path.join(PROJECTS_PATH, projectName);
    fs.removeSync(path.join(projectPath, '.apps/translationCore/checkData/selections'));
    makeProject_0_7_0(projectPath);
    return expect(ProjectStructureValidationHelpers.isProjectSupported(projectPath, translate)).resolves.toEqual(true);
  });
  test('should allow import of 0.9.0 project with checking', () => {
    const projectPath = path.join(PROJECTS_PATH, projectName);
    makeProject_0_9_0(projectPath);
    return expect(ProjectStructureValidationHelpers.isProjectSupported(projectPath, translate)).resolves.toEqual(true);
  });
  test('should allow import of 0.9.0 project without checking', () => {
    const projectPath = path.join(PROJECTS_PATH, projectName);
    fs.removeSync(path.join(projectPath, '.apps/translationCore/checkData/selections'));
    makeProject_0_9_0(projectPath);
    return expect(ProjectStructureValidationHelpers.isProjectSupported(projectPath, translate)).resolves.toEqual(true);
  });
  test('should allow import of pre-0.7.0 project without checking', () => {
    const projectPath = path.join(PROJECTS_PATH, projectName);
    makeProjectPre_0_7_0(projectPath);
    return expect(ProjectStructureValidationHelpers.isProjectSupported(projectPath, translate)).resolves.toEqual(true);
  });
  test('should not allow import of pre-0.7.0 project with notes checking', () => {
    const projectPath = path.join(PROJECTS_PATH, projectName);
    makeProjectPre_0_7_0(projectPath, true, false);
    return expect(ProjectStructureValidationHelpers.isProjectSupported(projectPath, translate)).rejects.toEqual(expectedRejection);
  });
  test('should not allow import of pre-0.7.0 project with word checking', () => {
    const projectPath = path.join(PROJECTS_PATH, projectName);
    makeProjectPre_0_7_0(projectPath, false, true);
    return expect(ProjectStructureValidationHelpers.isProjectSupported(projectPath, translate)).rejects.toEqual(expectedRejection);
  });
  test('should allow import of tStudio project', () => {
    const projectPath = path.join(PROJECTS_PATH, projectName);
    makeProjectTstudio(projectPath);
    return expect(ProjectStructureValidationHelpers.isProjectSupported(projectPath, translate)).resolves.toEqual(true);
  });

  test('should allow import of project editing with current APP version', () => {
    const projectPath = path.join(PROJECTS_PATH, projectName);
    const minVersion = APP_VERSION;
    const editVersion = minVersion;
    makeProject_version(projectPath, editVersion, minVersion);
    return expect(ProjectStructureValidationHelpers.isProjectSupported(projectPath, translate)).resolves.toEqual(true);
  });

  test('should allow import of project edited with older APP version', () => {
    const projectPath = path.join(PROJECTS_PATH, projectName);
    const minVersion = getPreviousVersion(APP_VERSION);
    const editVersion = minVersion;
    makeProject_version(projectPath, editVersion, minVersion);
    return expect(ProjectStructureValidationHelpers.isProjectSupported(projectPath, translate)).resolves.toEqual(true);
  });

  test('should not allow import of project edited with newer APP version', () => {
    const projectPath = path.join(PROJECTS_PATH, projectName);
    const minVersion = getNextVersion(APP_VERSION);
    const editVersion = minVersion;
    const expectedRejection = tc_MIN_VERSION_ERROR;
    makeProject_version(projectPath, editVersion, minVersion);
    return expect(ProjectStructureValidationHelpers.isProjectSupported(projectPath, translate)).rejects.toEqual(expectedRejection);
  });

  test('should allow import of project edited with newer APP version but compatible with this version', () => {
    const projectPath = path.join(PROJECTS_PATH, projectName);
    const minVersion = APP_VERSION;
    const editVersion = getNextVersion(APP_VERSION);
    makeProject_version(projectPath, editVersion, minVersion);
    return expect(ProjectStructureValidationHelpers.isProjectSupported(projectPath, translate)).resolves.toEqual(true);
  });

  test('should allow import of project edited with newer APP version but compatible with older version', () => {
    const projectPath = path.join(PROJECTS_PATH, projectName);
    const minVersion = getPreviousVersion(APP_VERSION);
    const editVersion = getNextVersion(APP_VERSION);
    makeProject_version(projectPath, editVersion, minVersion);
    return expect(ProjectStructureValidationHelpers.isProjectSupported(projectPath, translate)).resolves.toEqual(true);
  });

  test('should allow import of project edited with older APP version with no version info in manifest', () => {
    const projectPath = path.join(PROJECTS_PATH, projectName);
    const minVersion = null;
    const editVersion = null;
    makeProject_version(projectPath, editVersion, minVersion);
    return expect(ProjectStructureValidationHelpers.isProjectSupported(projectPath, translate)).resolves.toEqual(true);
  });

  test('should allow import of project edited with APP version with no min version info in manifest', () => {
    const projectPath = path.join(PROJECTS_PATH, projectName);
    const minVersion = null;
    const editVersion = getNextVersion(APP_VERSION);
    makeProject_version(projectPath, editVersion, minVersion);
    return expect(ProjectStructureValidationHelpers.isProjectSupported(projectPath, translate)).resolves.toEqual(true);
  });
});

describe('ProjectStructureValidationHelpers.testResourceByType', () => {
  beforeAll(() => {
    const sourcePath = path.join(__dirname, 'fixtures/project');
    const destinationPath = path.join(__dirname, 'fixtures/project');
    const copyFiles = ['projectVerification'];
    fs.__resetMockFS();
    fs.__loadFilesIntoMockFs(copyFiles, sourcePath, destinationPath);
  });
  //Testing false negatives for resources (tN, tW, tA) and Open Bible Stories
  test('should detect project as translationNotes', () => {
    let errMessage = ProjectStructureValidationHelpers.testResourceByType(en_tn_project, 'tn');
    expect(errMessage).toBeTruthy();
  });
  test('should detect project as translationAcademy', () => {
    let errMessage = ProjectStructureValidationHelpers.testResourceByType(en_ta_project, 'ta');
    expect(errMessage).toBeTruthy();
  });
  test('should detect project as translationWords', () => {
    let errMessage = ProjectStructureValidationHelpers.testResourceByType(en_tw_project, 'tw');
    expect(errMessage).toBeTruthy();
  });
  test('should detect project as translationWords', () => {
    let errMessage = ProjectStructureValidationHelpers.testResourceByType(obs_project_1, 'obs');
    expect(errMessage).toBeTruthy();
  });
  test('should detect project as Open Bible Stories', () => {
    let errMessage = ProjectStructureValidationHelpers.testResourceByType(obs_project_2, 'obs');
    expect(errMessage).toBeTruthy();
  });

  //Testing false positives for resources (tN, tW, tA) and Open Bible Stories
  test('should not detect project as translationNotes if it isnt', () => {
    let errMessage = ProjectStructureValidationHelpers.testResourceByType(en_ta_project, 'tn');
    expect(errMessage).toBeFalsy();
  });
  test('should not detect project as translationAcademy if it isnt', () => {
    let errMessage = ProjectStructureValidationHelpers.testResourceByType(en_tn_project, 'ta');
    expect(errMessage).toBeFalsy();
  });
  test('should not detect project as translationWords if it isnt', () => {
    let errMessage = ProjectStructureValidationHelpers.testResourceByType(en_ta_project, 'tw');
    expect(errMessage).toBeFalsy();
  });
  test('should not detect project as Open Bible Stories if it isnt', () => {
    let errMessage = ProjectStructureValidationHelpers.testResourceByType(en_tw_project, 'obs');
    expect(errMessage).toBeFalsy();
  });
});

describe('getUniqueBookIds', () => {
  test('returns correct book count', () => {
    let ids = ProjectStructureValidationHelpers.getUniqueBookIds(multibook_project_2);
    expect(ids).toHaveLength(27);
  });

  test('returns correct book count for nested books', () => {
    let ids = ProjectStructureValidationHelpers.getUniqueBookIds(multibook_project_1);
    expect(ids).toHaveLength(27);
  });

  test('returns correct book count with limit exceeded', () => {
    let ids = ProjectStructureValidationHelpers.getUniqueBookIds(multibook_project_1, 2);
    expect(ids).toHaveLength(2);
  });

  test('returns correct book count with limit under-achived', () => {
    let ids = ProjectStructureValidationHelpers.getUniqueBookIds(multibook_project_1, 2000);
    expect(ids).toHaveLength(27);
  });

  test('returns correct book count with duplicate books', () => {
    let ids = ProjectStructureValidationHelpers.getUniqueBookIds(dupbooks_project);
    expect(ids).toHaveLength(2);
  });

  test('returns correct book count with invalid book', () => {
    let ids = ProjectStructureValidationHelpers.getUniqueBookIds(invalidbook_project);
    expect(ids).toHaveLength(0);
  });
});

// NOTE: this is slightly redundant since this method is based on getUniqueBookIds
describe('projectHasMultipleBooks', () => {
  test('has multiple books', () => {
    let result = ProjectStructureValidationHelpers.projectHasMultipleBooks(multibook_project_1);
    expect(result).toBeTruthy();
  });
  test('has multiple books alt', () => {
    let result = ProjectStructureValidationHelpers.projectHasMultipleBooks(multibook_project_2);
    expect(result).toBeTruthy();
  });
  test('has a single book', () => {
    let result = ProjectStructureValidationHelpers.projectHasMultipleBooks(singlebook_project);
    expect(result).toBeFalsy();
  });
  test('has no books', () => {
    let result = ProjectStructureValidationHelpers.projectHasMultipleBooks(nobooks_project);
    expect(result).toBeFalsy();
  });

  test('tw has no books', () => {
    let result = ProjectStructureValidationHelpers.projectHasMultipleBooks(en_tw_project);
    expect(result).toBeFalsy();
  });
});

describe('verifyValidBetaProject', () => {
  var state_ = {
    settingsReducer: { currentSettings: { developerMode: true } },
    projectDetailsReducer: { manifest: { project: { id: 'tit' } } },
  };

  test('valid beta project with developer mode', () => {
    const state = _.cloneDeep(state_);
    return expect(ProjectStructureValidationHelpers.verifyValidBetaProject(state)).resolves.toBe();
  });
  test('valid beta project without developer mode', () => {
    const state = _.cloneDeep(state_);
    state.settingsReducer.currentSettings.developerMode = false;
    return expect(ProjectStructureValidationHelpers.verifyValidBetaProject(state)).resolves.toBe();
  });
  test('is not valid beta project without developer mode and not old or new testament', () => {
    const state = _.cloneDeep(state_);
    state.settingsReducer.currentSettings.developerMode = false;
    state.projectDetailsReducer.manifest.project.id = 'fakebook';
    return expect(ProjectStructureValidationHelpers.verifyValidBetaProject(state)).rejects.toBe('tools.book_not_supported');
  });
  test('valid beta project without developer mode and old testament', () => {
    const state = _.cloneDeep(state_);
    state.settingsReducer.currentSettings.developerMode = false;
    state.projectDetailsReducer.manifest.project.id = '1ki';
    return expect(ProjectStructureValidationHelpers.verifyValidBetaProject(state)).resolves.toBe();
  });
  test('valid beta project with developer mode and old testament', () => {
    const state = _.cloneDeep(state_);
    return expect(ProjectStructureValidationHelpers.verifyValidBetaProject(state)).resolves.toBe();
  });
});

describe('versionCompare', () => {
  test('1.1.4 === 1.1.4', () => {
    const a = '1.1.4';
    const b = '1.1.4';
    const expectedCompare = 0;
    const compare = ProjectStructureValidationHelpers.versionCompare(a, b);
    expect(compare).toEqual(expectedCompare);
  });

  test('1.1.3 < 1.1.4', () => {
    const a = '1.1.3';
    const b = '1.1.4';
    const expectedCompare = -1;
    const compare = ProjectStructureValidationHelpers.versionCompare(a, b);
    expect(compare).toEqual(expectedCompare);
  });

  test('1.1.1 > 1.1.0', () => {
    const a = '1.1.1';
    const b = '1.1.0';
    const expectedCompare = 1;
    const compare = ProjectStructureValidationHelpers.versionCompare(a, b);
    expect(compare).toEqual(expectedCompare);
  });

  test('0.10.0 < 0.10.1', () => {
    const a = '0.10.0';
    const b = '0.10.1';
    const expectedCompare = -1;
    const compare = ProjectStructureValidationHelpers.versionCompare(a, b);
    expect(compare).toEqual(expectedCompare);
  });

  test('1.0.0 > 0.10.1', () => {
    const a = '1.0.0';
    const b = '0.10.1';
    const expectedCompare = 1;
    const compare = ProjectStructureValidationHelpers.versionCompare(a, b);
    expect(compare).toEqual(expectedCompare);
  });
});

//
// helpers
//

export function versionToString(version) {
  return ((version.major || '0') + '.' + (version.minor || '0') + '.' + (version.patch || '0'));
}

export function getSemVersion(version) {
  let version_;

  if (typeof version === 'string') {
    version_ = semver.parse(version);
  } else {
    version_ = _.cloneDeep(version);
  }
  return version_;
}

export function getPreviousVersion(version) {
  let version_ = getSemVersion(version);

  if ( --version_.patch < 0) {
    version_.patch = 0;

    if ( --version_.minor < 0) {
      version_.minor = 0;
      --version_.major;
    }
  }
  return versionToString(version_);
}

export function getNextVersion(version) {
  let version_ = getSemVersion(version);
  ++version_.patch;
  return versionToString(version_);
}

export function getNextMajorVersion(version) {
  let version_ = getSemVersion(version);
  version_.inc('major');
  return versionToString(version_);
}

function makeProject_version(projectPath, editVersion, minVersion) {
  const manifest = manifestUtils.getProjectManifest(projectPath, undefined);
  manifest.tc_version = 5;

  if (minVersion !== null) {
    manifest[tc_MIN_COMPATIBLE_VERSION_KEY] = minVersion;
  } else {
    delete manifest[tc_MIN_COMPATIBLE_VERSION_KEY];
  }

  if (editVersion !== null) {
    manifest[tc_EDIT_VERSION_KEY] = editVersion;
  } else {
    delete manifest[tc_EDIT_VERSION_KEY];
  }
  manifestUtils.saveProjectManifest(projectPath, manifest);
}

function makeProject_0_8_0(projectPath) {
  const manifest = manifestUtils.getProjectManifest(projectPath, undefined);
  delete manifest.tc_version;
  manifestUtils.saveProjectManifest(projectPath, manifest);
}

function makeProject_0_9_0(projectPath) {
  const manifest = manifestUtils.getProjectManifest(projectPath, undefined);
  manifest.tc_version = 5;
  manifestUtils.saveProjectManifest(projectPath, manifest);
}

function makeProject_0_7_0(projectPath) {
  const manifest = manifestUtils.getProjectManifest(projectPath, undefined);
  delete manifest.tc_version;
  delete manifest.license;
  delete manifest.tcInitialized;
  manifestUtils.saveProjectManifest(projectPath, manifest);
}

function makeProjectTstudio(projectPath) {
  const manifest = manifestUtils.getProjectManifest(projectPath, undefined);
  delete manifest.tc_version;
  delete manifest.license;
  delete manifest.tcInitialized;
  fs.removeSync(path.join(projectPath, '.apps'));
  manifestUtils.saveProjectManifest(projectPath, manifest);
}

function makeProjectPre_0_7_0(projectPath, addNotes, addWords) {
  const manifest = manifestUtils.getProjectManifest(projectPath, undefined);
  delete manifest.tc_version;
  delete manifest.license;
  delete manifest.tcInitialized;
  const selectionsFolder = path.join(projectPath, '.apps/translationCore/checkData/selections');

  if (addNotes) {
    const oldTnotesCheckingDataPath = path.join(projectPath, 'checkdata/TranslationNotesChecker.tc');
    fs.copySync(selectionsFolder, oldTnotesCheckingDataPath);
  }

  if (addWords) {
    const oldTwordsCheckingDataPath = path.join(projectPath, 'checkdata/TranslationWordsChecker.tc');
    fs.copySync(selectionsFolder, oldTwordsCheckingDataPath);
  }
  fs.removeSync(path.join(projectPath, '.apps'));
  manifestUtils.saveProjectManifest(projectPath, manifest);
}

