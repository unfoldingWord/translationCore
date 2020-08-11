
import fs from 'fs-extra';
import path from 'path-extra';
// actions
import * as ProjectInformationCheckHelpers from '../js/helpers/ProjectInformationCheckHelpers';
// constants
import { PROJECTS_PATH, IMPORTS_PATH } from '../js/common/constants';

describe('ProjectDetailsActions.getDuplicateProjectWarning()', () => {
  const currentProjectName = 'fr_ult_eph_book';
  const currentProjectPath = path.join(PROJECTS_PATH, currentProjectName);
  const currentProjectManifestPath = path.join(currentProjectPath, 'manifest.json');
  let manifest = null;
  const langID = 'fr';
  const bookId = 'eph';
  const resourceId = 'ult';

  beforeEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
    // Set up mock filesystem before each test
    fs.__setMockFS({ [currentProjectPath]: '' });
    manifest = {
      target_language: {
        id: langID,
        name: 'francais',
        direction: 'ltr',
      },
      project: {
        id: bookId,
        name: 'Ephesians',
      },
      resource: {
        id: resourceId,
        name: 'unfoldingWord Literal Text',
      },
    };
  });

  afterEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
  });

  test('does nothing if current project is only match for settings', () => {
    // given
    const expectedResults = null;
    fs.outputJsonSync(currentProjectManifestPath, manifest);

    // when
    const results = ProjectInformationCheckHelpers.getDuplicateProjectWarning(resourceId, langID, bookId, currentProjectPath);

    // then
    expect(results).toEqual(expectedResults);
  });

  test('does nothing if current project is in imports and nothing is in projects folder', () => {
    // given
    const expectedResults = null;
    fs.__resetMockFS();

    // when
    const results = ProjectInformationCheckHelpers.getDuplicateProjectWarning(resourceId, langID, bookId, currentProjectPath);

    // then
    expect(results).toEqual(expectedResults);
  });

  test('returns error message if another project has same settings', () => {
    // given
    const expectedResults = 'project_validation.conflicting_project';
    fs.outputJsonSync(currentProjectManifestPath, manifest);
    const duplicateProject = 'fr_ult_eph';
    const duplicateProjectPath = path.join(PROJECTS_PATH, duplicateProject);
    fs.copySync(currentProjectPath, duplicateProjectPath);

    // when
    const results = ProjectInformationCheckHelpers.getDuplicateProjectWarning(resourceId, langID, bookId, currentProjectPath);

    // then
    expect(results).toEqual(expectedResults);
  });

  test('returns error message current project is in imports and another project has same settings', () => {
    // given
    const expectedResults = 'project_validation.conflicting_project';
    fs.outputJsonSync(currentProjectManifestPath, manifest);
    const currentProjectPath = path.join(IMPORTS_PATH, currentProjectName);

    // when
    const results = ProjectInformationCheckHelpers.getDuplicateProjectWarning(resourceId, langID, bookId, currentProjectPath);

    // then
    expect(results).toEqual(expectedResults);
  });
});

describe('ProjectInformationCheckHelpers.verifyAllRequiredFieldsAreCompleted()', () => {
  const currentProjectName = 'fr_ult_eph_book';
  const currentProjectPath = path.join(PROJECTS_PATH, currentProjectName);
  const default_state = {
    projectInformationCheckReducer: {
      bookId: 'eph',
      resourceId: 'ult',
      nickname: 'My Project',
      languageId: 'fr',
      languageName: 'french',
      languageDirection: 'ltr',
      contributors: ['manny', 'some other guy'],
      checkers: ['manny', 'superman'],
      alreadyImported: true,
      overwritePermitted: false,
    },
    projectDetailsReducer: { projectSaveLocation: currentProjectPath },
  };

  const currentProjectManifestPath = path.join(currentProjectPath, 'manifest.json');
  let manifest = null;
  const langID = 'fr';
  const bookId = 'eph';
  const resourceId = 'ult';

  beforeEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
    // Set up mock filesystem before each test
    fs.__setMockFS({ [currentProjectPath]: '' });
    manifest = {
      target_language: {
        id: langID,
        name: 'francais',
        direction: 'ltr',
      },
      project: {
        id: bookId,
        name: 'Ephesians',
      },
      resource: {
        id: resourceId,
        name: 'unfoldingWord Literal Text',
      },
    };
    fs.outputJsonSync(currentProjectManifestPath, manifest);
  });

  afterEach(() => {
    // reset mock filesystem data
    fs.__resetMockFS();
  });

  test('with valid project details should be valid', () => {
    // given
    const state = JSON.parse(JSON.stringify(default_state)); // clone before modifying
    const expectedValid = true;

    // when
    const valid = ProjectInformationCheckHelpers.verifyAllRequiredFieldsAreCompleted(state);

    // then
    expect(valid).toEqual(expectedValid);
  });

  test('with valid project details and overwrite permitted should be valid', () => {
    // given
    const state = JSON.parse(JSON.stringify(default_state)); // clone before modifying
    state.projectInformationCheckReducer.overwritePermitted = true;
    const expectedValid = true;

    // when
    const valid = ProjectInformationCheckHelpers.verifyAllRequiredFieldsAreCompleted(state);

    // then
    expect(valid).toEqual(expectedValid);
  });

  test('with project conflict and no overwrite permitted should be invalid', () => {
    // given
    const state = JSON.parse(JSON.stringify(default_state)); // clone before modifying
    const duplicateProjectPath = path.join(PROJECTS_PATH, 'fr_eph');
    fs.copySync(currentProjectPath, duplicateProjectPath);
    state.projectInformationCheckReducer.overwritePermitted = false;
    const expectedValid = false;

    // when
    const valid = ProjectInformationCheckHelpers.verifyAllRequiredFieldsAreCompleted(state);

    // then
    expect(valid).toEqual(expectedValid);
  });

  test('with missing bookId should be invalid', () => {
    // given
    const state = JSON.parse(JSON.stringify(default_state)); // clone before modifying
    delete state.projectInformationCheckReducer.bookId;
    const expectedValid = false;

    // when
    const valid = ProjectInformationCheckHelpers.verifyAllRequiredFieldsAreCompleted(state);

    // then
    expect(valid).toEqual(expectedValid);
  });

  test('with OT bookId should be valid when not in developer mode', () => {
    // given
    const state = JSON.parse(JSON.stringify(default_state)); // clone before modifying
    state.projectInformationCheckReducer.bookId = 'jon';
    const expectedValid = true;

    // when
    const valid = ProjectInformationCheckHelpers.verifyAllRequiredFieldsAreCompleted(state);

    // then
    expect(valid).toEqual(expectedValid);
  });

  test('with OT bookId should be valid when in developer mode', () => {
    // given
    const state = JSON.parse(JSON.stringify(default_state)); // clone before modifying
    state.projectInformationCheckReducer.bookId = 'jon';
    state.settingsReducer = { currentSettings: { developerMode: true } };

    const expectedValid = true;

    // when
    const valid = ProjectInformationCheckHelpers.verifyAllRequiredFieldsAreCompleted(state);

    // then
    expect(valid).toEqual(expectedValid);
  });

  test('with missing resourceId should be invalid', () => {
    // given
    const state = JSON.parse(JSON.stringify(default_state)); // clone before modifying
    delete state.projectInformationCheckReducer.resourceId;
    const expectedValid = false;

    // when
    const valid = ProjectInformationCheckHelpers.verifyAllRequiredFieldsAreCompleted(state);

    // then
    expect(valid).toEqual(expectedValid);
  });

  test('with invalid resourceId should be invalid', () => {
    // given
    const state = JSON.parse(JSON.stringify(default_state)); // clone before modifying
    state.projectInformationCheckReducer.resourceId = 'xyz3';
    const expectedValid = false;

    // when
    const valid = ProjectInformationCheckHelpers.verifyAllRequiredFieldsAreCompleted(state);

    // then
    expect(valid).toEqual(expectedValid);
  });

  test('with missing languageId should be invalid', () => {
    // given
    const state = JSON.parse(JSON.stringify(default_state)); // clone before modifying
    delete state.projectInformationCheckReducer.languageId;
    const expectedValid = false;

    // when
    const valid = ProjectInformationCheckHelpers.verifyAllRequiredFieldsAreCompleted(state);

    // then
    expect(valid).toEqual(expectedValid);
  });

  test('with invalid languageId should be invalid', () => {
    // given
    const state = JSON.parse(JSON.stringify(default_state)); // clone before modifying
    state.projectInformationCheckReducer.languageId = 'xyz';
    const expectedValid = false;

    // when
    const valid = ProjectInformationCheckHelpers.verifyAllRequiredFieldsAreCompleted(state);

    // then
    expect(valid).toEqual(expectedValid);
  });

  test('with missing languageName should be invalid', () => {
    // given
    const state = JSON.parse(JSON.stringify(default_state)); // clone before modifying
    delete state.projectInformationCheckReducer.languageName;
    const expectedValid = false;

    // when
    const valid = ProjectInformationCheckHelpers.verifyAllRequiredFieldsAreCompleted(state);

    // then
    expect(valid).toEqual(expectedValid);
  });

  test('with missing languageDirection should be invalid', () => {
    // given
    const state = JSON.parse(JSON.stringify(default_state)); // clone before modifying
    delete state.projectInformationCheckReducer.languageDirection;
    const expectedValid = false;

    // when
    const valid = ProjectInformationCheckHelpers.verifyAllRequiredFieldsAreCompleted(state);

    // then
    expect(valid).toEqual(expectedValid);
  });

  test('with empty contributor should be invalid', () => {
    // given
    const state = JSON.parse(JSON.stringify(default_state)); // clone before modifying
    delete state.projectInformationCheckReducer.contributors.push('');
    const expectedValid = false;

    // when
    const valid = ProjectInformationCheckHelpers.verifyAllRequiredFieldsAreCompleted(state);

    // then
    expect(valid).toEqual(expectedValid);
  });

  test('with empty checker should be invalid', () => {
    // given
    const state = JSON.parse(JSON.stringify(default_state)); // clone before modifying
    delete state.projectInformationCheckReducer.checkers.push('');
    const expectedValid = false;

    // when
    const valid = ProjectInformationCheckHelpers.verifyAllRequiredFieldsAreCompleted(state);

    // then
    expect(valid).toEqual(expectedValid);
  });
});

describe('ProjectInformationCheckHelpers.checkProjectDetails()', () => {
  test('with valid project details should be valid', () => {
    // given
    const manifest = {
      project: {
        id: 'tit',
        name: 'Titus',
      },
      resource: {
        id: 'ult',
        nname: 'My Project',
      },
    };
    const expectedInvalid = false;

    // when
    const invalid = ProjectInformationCheckHelpers.checkProjectDetails(manifest);

    // then
    expect(invalid).toEqual(expectedInvalid);
  });

  test('with missing project.id should be invalid', () => {
    // given
    const manifest = {
      project: { name: 'Titus' },
      resource: {
        id: 'ult',
        name: 'My Project',
      },
    };
    const expectedInvalid = true;

    // when
    const invalid = ProjectInformationCheckHelpers.checkProjectDetails(manifest);

    // then
    expect(invalid).toEqual(expectedInvalid);
  });

  test('with missing project.name should be invalid', () => {
    // given
    const manifest = {
      project: { id: 'tit' },
      resource: {
        id: 'ult',
        iname: 'My Project',
      },
    };
    const expectedInvalid = true;

    // when
    const invalid = ProjectInformationCheckHelpers.checkProjectDetails(manifest);

    // then
    expect(invalid).toEqual(expectedInvalid);
  });

  test('with missing resource.id (resourceId) should be invalid', () => {
    // given
    const manifest = {
      project: {
        id: 'tit',
        name: 'Titus',
      },
      resource: { name: 'My Project' },
    };
    const expectedInvalid = true;

    // when
    const invalid = ProjectInformationCheckHelpers.checkProjectDetails(manifest);

    // then
    expect(invalid).toEqual(expectedInvalid);
  });

  test('with short resource.id (resourceId) should be invalid', () => {
    // given
    const manifest = {
      project: {
        id: 'tit',
        name: 'Titus',
      },
      resource: {
        id: 'ul',
        name: 'My Project',
      },
    };
    const expectedInvalid = true;

    // when
    const invalid = ProjectInformationCheckHelpers.checkProjectDetails(manifest);

    // then
    expect(invalid).toEqual(expectedInvalid);
  });

  test('with invalid resource.id should be invalid', () => {
    // given
    const manifest = {
      project: {
        id: 'tit',
        name: 'Titus',
      },
      resource: {
        id: 'ul12',
        name: 'My Project',
      },
    };
    const expectedInvalid = true;

    // when
    const invalid = ProjectInformationCheckHelpers.checkProjectDetails(manifest);

    // then
    expect(invalid).toEqual(expectedInvalid);
  });

  test('with missing resource.name should still be valid', () => {
    // given
    const manifest = {
      project: {
        id: 'tit',
        name: 'Titus',
      },
      resource: { id: 'ult' },
    };
    const expectedInvalid = false;

    // when
    const invalid = ProjectInformationCheckHelpers.checkProjectDetails(manifest);

    // then
    expect(invalid).toEqual(expectedInvalid);
  });

  test('with missing project in manifest should be invalid', () => {
    // given
    const manifest = {};
    const expectedInvalid = true;

    // when
    const invalid = ProjectInformationCheckHelpers.checkProjectDetails(manifest);

    // then
    expect(invalid).toEqual(expectedInvalid);
  });
});

describe('ProjectInformationCheckHelpers.checkLanguageDetails()', () => {
  test('with valid language settings should be valid', () => {
    // given
    const manifest = {
      target_language: {
        id: 'fr',
        name: 'francais',
        direction: 'ltr',
      },
    };

    // when
    const invalid = ProjectInformationCheckHelpers.checkLanguageDetails(manifest);

    // then
    expect(invalid).toEqual(false);
  });

  test('with empty manifest should be invalid', () => {
    // given
    const manifest = { };

    // when
    const invalid = ProjectInformationCheckHelpers.checkLanguageDetails(manifest);

    // then
    expect(invalid).toEqual(true);
  });

  test('with language id & name swapped should be invalid', () => {
    // given
    const manifest = {
      target_language: {
        id: 'francais',
        name: 'fr',
        direction: 'ltr',
      },
    };

    // when
    const invalid = ProjectInformationCheckHelpers.checkLanguageDetails(manifest);

    // then
    expect(invalid).toEqual(true);
  });

  test('with invalid language id should be invalid', () => {
    // given
    const manifest = {
      target_language: {
        id: 'zk',
        name: 'Zanaki',
        direction: 'ltr',
      },
    };

    // when
    const invalid = ProjectInformationCheckHelpers.checkLanguageDetails(manifest);

    // then
    expect(invalid).toEqual(true);
  });

  test('with empty language id should be invalid', () => {
    // given
    const manifest = {
      target_language: {
        id: '',
        name: 'francais',
        direction: 'ltr',
      },
    };

    // when
    const invalid = ProjectInformationCheckHelpers.checkLanguageDetails(manifest);

    // then
    expect(invalid).toEqual(true);
  });

  test('with missing language id should be invalid', () => {
    // given
    const manifest = {
      target_language: {
        name: 'francais',
        direction: 'ltr',
      },
    };

    // when
    const invalid = ProjectInformationCheckHelpers.checkLanguageDetails(manifest);

    // then
    expect(invalid).toEqual(true);
  });

  test('with empty language name should be invalid', () => {
    // given
    const manifest = {
      target_language: {
        id: 'fr',
        name: '',
        direction: 'ltr',
      },
    };

    // when
    const invalid = ProjectInformationCheckHelpers.checkLanguageDetails(manifest);

    // then
    expect(invalid).toEqual(true);
  });

  test('with missing language name should be invalid', () => {
    // given
    const manifest = {
      target_language: {
        id: 'fr',
        direction: 'ltr',
      },
    };

    // when
    const invalid = ProjectInformationCheckHelpers.checkLanguageDetails(manifest);

    // then
    expect(invalid).toEqual(true);
  });

  test('with missing language direction should be invalid', () => {
    // given
    const manifest = {
      target_language: {
        id: 'fr',
        name: 'francais',
      },
    };

    // when
    const invalid = ProjectInformationCheckHelpers.checkLanguageDetails(manifest);

    // then
    expect(invalid).toEqual(true);
  });

  test('with blank language direction should be invalid', () => {
    // given
    const manifest = {
      target_language: {
        id: 'fr',
        name: 'francais',
        direction: '',
      },
    };

    // when
    const invalid = ProjectInformationCheckHelpers.checkLanguageDetails(manifest);

    // then
    expect(invalid).toEqual(true);
  });
});

describe('ProjectInformationCheckHelpers.getResourceIdWarning', () => {
  test('empty string should give warning', () => {
    // given
    const text = '';
    const expectedResults = 'project_validation.field_required';

    // when
    const results = ProjectInformationCheckHelpers.getResourceIdWarning(text);

    // then
    expect(results).toEqual(expectedResults);
  });

  test('null string should give warning', () => {
    // given
    const text = '';
    const expectedResults = 'project_validation.field_required';

    // when
    const results = ProjectInformationCheckHelpers.getResourceIdWarning(text);

    // then
    expect(results).toEqual(expectedResults);
  });

  test('short string should give warning', () => {
    // given
    const text = 'AA';
    const expectedResults = 'project_validation.resource_id.field_invalid_length';

    // when
    const results = ProjectInformationCheckHelpers.getResourceIdWarning(text);

    // then
    expect(results).toEqual(expectedResults);
  });

  test('space in string should give warning', () => {
    // given
    const text = 'AA ';
    const expectedResults = 'project_validation.resource_id.invalid_characters';

    // when
    const results = ProjectInformationCheckHelpers.getResourceIdWarning(text);

    // then
    expect(results).toEqual(expectedResults);
  });

  test('upper case letters should not give warning', () => {
    // given
    const text = 'ULT';
    const expectedResults = null;

    // when
    const results = ProjectInformationCheckHelpers.getResourceIdWarning(text);

    // then
    expect(results).toEqual(expectedResults);
  });

  test('lower case letters should not give warning', () => {
    // given
    const text = 'ugnt';
    const expectedResults = null;

    // when
    const results = ProjectInformationCheckHelpers.getResourceIdWarning(text);

    // then
    expect(results).toEqual(expectedResults);
  });

  test('5 letters should give warning', () => {
    // given
    const text = 'ugnta';
    const expectedResults = 'project_validation.resource_id.field_invalid_length';

    // when
    const results = ProjectInformationCheckHelpers.getResourceIdWarning(text);

    // then
    expect(results).toEqual(expectedResults);
  });

  test('letters with trailing dash should give warning', () => {
    // given
    const text = 'ab-';
    const expectedResults = 'project_validation.resource_id.invalid_characters';

    // when
    const results = ProjectInformationCheckHelpers.getResourceIdWarning(text);

    // then
    expect(results).toEqual(expectedResults);
  });

  test('letters with leading dash should give warning', () => {
    // given
    const text = '-ab';
    const expectedResults = 'project_validation.resource_id.invalid_characters';

    // when
    const results = ProjectInformationCheckHelpers.getResourceIdWarning(text);

    // then
    expect(results).toEqual(expectedResults);
  });

  test('letters containing dash should give warning', () => {
    // given
    const text = 'a-b';
    const expectedResults = 'project_validation.resource_id.invalid_characters';

    // when
    const results = ProjectInformationCheckHelpers.getResourceIdWarning(text);

    // then
    expect(results).toEqual(expectedResults);
  });

  test('letters with number should give warning', () => {
    // given
    const text = 'ab1';
    const expectedResults = 'project_validation.resource_id.invalid_characters';

    // when
    const results = ProjectInformationCheckHelpers.getResourceIdWarning(text);

    // then
    expect(results).toEqual(expectedResults);
  });

  test('letters with Unicode char should give warning', () => {
    // given
    const text = 'abÀ';
    const expectedResults = 'project_validation.resource_id.invalid_characters';

    // when
    const results = ProjectInformationCheckHelpers.getResourceIdWarning(text);

    // then
    expect(results).toEqual(expectedResults);
  });
});
