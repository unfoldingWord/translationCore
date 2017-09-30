//helpers
import * as ProjectSelectionHelpers from '../src/js/helpers/ProjectSelectionHelpers';
//projects
const obs_project_1 = '__tests__/fixtures/project/projectVerification/obs_project_1';
const obs_project_2 = '__tests__/fixtures/project/projectVerification/obs_project_2';
const multibook_project_1 = '__tests__/fixtures/project/projectVerification/multibook_project_1';
const multibook_project_2 = '__tests__/fixtures/project/projectVerification/multibook_project_2';
const singlebook_project = '__tests__/fixtures/project/projectVerification/singlebook_project';
const dupbooks_project = '__tests__/fixtures/project/projectVerification/duplicate_books';
const invalidbook_project = '__tests__/fixtures/project/projectVerification/invalid_books';
const nobooks_project = '__tests__/fixtures/project/projectVerification/no_books';
const en_ta_project = '__tests__/fixtures/project/projectVerification/en_ta';
const en_tw_project = '__tests__/fixtures/project/projectVerification/en_tw';
const en_tn_project = '__tests__/fixtures/project/projectVerification/en_tn';

describe('ProjectSelectionHelpers.testResourceByType', () => {
    //Testing false negatives for resources (tN, tW, tA) and Open Bible Stories
    test('should detect project as translationNotes', () => {
        let errMessage = ProjectSelectionHelpers.testResourceByType(en_tn_project, 'tn');
        expect(errMessage).toBeTruthy();
    });
    test('should detect project as translationAcademy', () => {
        let errMessage = ProjectSelectionHelpers.testResourceByType(en_ta_project, 'ta');
        expect(errMessage).toBeTruthy();
    });
    test('should detect project as translationWords', () => {
        let errMessage = ProjectSelectionHelpers.testResourceByType(en_tw_project, 'tw');
        expect(errMessage).toBeTruthy();
    });
    test('should detect project as translationWords', () => {
        let errMessage = ProjectSelectionHelpers.testResourceByType(obs_project_1, 'obs');
        expect(errMessage).toBeTruthy();
    });
    test('should detect project as Open Bible Stories', () => {
        let errMessage = ProjectSelectionHelpers.testResourceByType(obs_project_2, 'obs');
        expect(errMessage).toBeTruthy();
    });

    //Testing false positives for resources (tN, tW, tA) and Open Bible Stories
    test('should not detect project as translationNotes if it isnt', () => {
        let errMessage = ProjectSelectionHelpers.testResourceByType(en_ta_project, 'tn');
        expect(errMessage).toBeFalsy();
    });
    test('should not detect project as translationAcademy if it isnt', () => {
        let errMessage = ProjectSelectionHelpers.testResourceByType(en_tn_project, 'ta');
        expect(errMessage).toBeFalsy();
    });
    test('should not detect project as translationWords if it isnt', () => {
        let errMessage = ProjectSelectionHelpers.testResourceByType(en_ta_project, 'tw');
        expect(errMessage).toBeFalsy();
    });
    test('should not detect project as Open Bible Stories if it isnt', () => {
        let errMessage = ProjectSelectionHelpers.testResourceByType(en_tw_project, 'obs');
        expect(errMessage).toBeFalsy();
    });
});

describe('getUniqueBookIds', () => {
    test('returns correct book count', () => {
        let ids = ProjectSelectionHelpers.getUniqueBookIds(multibook_project_2);
        expect(ids).toHaveLength(27)
    });

    test('returns correct book count for nested books', () => {
        let ids = ProjectSelectionHelpers.getUniqueBookIds(multibook_project_1);
        expect(ids).toHaveLength(27)
    });

    test('returns correct book count with limit exceeded', () => {
        let ids = ProjectSelectionHelpers.getUniqueBookIds(multibook_project_1, 2);
        expect(ids).toHaveLength(2)
    });

    test('returns correct book count with limit under-achived', () => {
        let ids = ProjectSelectionHelpers.getUniqueBookIds(multibook_project_1, 2000);
        expect(ids).toHaveLength(27)
    });

    test('returns correct book count with duplicate books', () => {
        let ids = ProjectSelectionHelpers.getUniqueBookIds(dupbooks_project);
        expect(ids).toHaveLength(2)
    });

    test('returns correct book count with invalid book', () => {
        let ids = ProjectSelectionHelpers.getUniqueBookIds(invalidbook_project);
        expect(ids).toHaveLength(0)
    });
});

// NOTE: this is slightly redundant since this method is based on getUniqueBookIds
describe('projectHasMultipleBooks', () => {
    test('has multiple books', () => {
        let result = ProjectSelectionHelpers.projectHasMultipleBooks(multibook_project_1);
        expect(result).toBeTruthy()
    });
    test('has multiple books alt', () => {
        let result = ProjectSelectionHelpers.projectHasMultipleBooks(multibook_project_2);
        expect(result).toBeTruthy()
    });
    test('has a single book', () => {
        let result = ProjectSelectionHelpers.projectHasMultipleBooks(singlebook_project);
        expect(result).toBeFalsy()
    });
    test('has no books', () => {
        let result = ProjectSelectionHelpers.projectHasMultipleBooks(nobooks_project);
        expect(result).toBeFalsy()
    });

    test('tw has no books', () => {
        let result = ProjectSelectionHelpers.projectHasMultipleBooks(en_tw_project);
        expect(result).toBeFalsy()
    });
});