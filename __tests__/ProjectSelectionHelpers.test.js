//helpers
import * as ProjectSelectionHelpers from '../src/js/helpers/ProjectSelectionHelpers';
//projects
const obs_project_1 = '__tests__/fixtures/project/projectVerification/obs_project_1';
const obs_project_2 = '__tests__/fixtures/project/projectVerification/obs_project_2';
const multibook_project_1 = '__tests__/fixtures/project/projectVerification/multibook_project_1';
const multibook_project_2 = '__tests__/fixtures/project/projectVerification/multibook_project_2';
const en_ta_project = '__tests__/fixtures/project/projectVerification/en_ta';
const en_tw_project = '__tests__/fixtures/project/projectVerification/en_tw';
const en_tn_project = '__tests__/fixtures/project/projectVerification/en_tn';

describe('getUniqueBookIds', () => {
    test('returns correct book count', () => {
        let ids = ProjectSelectionHelpers.getUniqueBookIds(multibook_project_2);
        expect(ids).toHaveLength(27)
    });

    test('returns correct book count for nested books', () => {
        let ids = ProjectSelectionHelpers.getUniqueBookIds(multibook_project_1);
        expect(ids).toHaveLength(27)
    });

    rest('returns correct book count with limit exceeded', () => {

    });
});

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

describe('ProjectSelectionHelpers.generalMultiBookProjectSearch', () => {
    //Testing false negatives for multiple book projects
    test('should detect project as having multiple books', () => {
        let numberOfUSFMBooksInProjects = ProjectSelectionHelpers.generalMultiBookProjectSearch(multibook_project_1);
        expect(numberOfUSFMBooksInProjects).toBeGreaterThan(1);
    });
    test('should detect project as having multiple books', () => {
        let numberOfUSFMBooksInProjects = ProjectSelectionHelpers.generalMultiBookProjectSearch(multibook_project_2);
        expect(numberOfUSFMBooksInProjects).toBeGreaterThan(1);
    });

    //Testing false negatives for multiple book projects
    test('should not detect project as having multiple books if it isn\'t', () => {
        let numberOfUSFMBooksInProjects = ProjectSelectionHelpers.generalMultiBookProjectSearch(obs_project_1);
        expect(numberOfUSFMBooksInProjects).not.toBeGreaterThan(1);
    });
    test('should not detect project as having multiple books if it isn\'t', () => {
        let numberOfUSFMBooksInProjects = ProjectSelectionHelpers.generalMultiBookProjectSearch(en_tw_project);
        expect(numberOfUSFMBooksInProjects).not.toBeGreaterThan(1);
    });
});
