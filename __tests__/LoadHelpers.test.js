/* eslint-disable no-console */
/* eslint-env jest */

import * as bibleHelpers from '../src/js/helpers/bibleHelpers';

const workingProjectExpectedPath = '__tests__/fixtures/project/missingVerses/no_missing_verses';
const missingVerseExpectedPath = '__tests__/fixtures/project/missingVerses/some_missing_verses';

describe('Valid Project Actions', () => {

    test('should return project is missing verses', () => {
        const isMissing = bibleHelpers.isProjectMissingVerses(missingVerseExpectedPath, 'php', '__tests__/fixtures/resources');
        expect(isMissing).toBeTruthy();
    });

    test('should return project is not missing verses', () => {
        const isMissing = bibleHelpers.isProjectMissingVerses(workingProjectExpectedPath, 'tit', '__tests__/fixtures/resources');
        expect(isMissing).toBeFalsy();
    });
});
