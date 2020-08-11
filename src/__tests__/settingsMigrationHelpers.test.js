import * as settingsMigrationHelpers from '../js/helpers/settingsMigrationHelpers';
import {
  ORIGINAL_LANGUAGE, TARGET_LANGUAGE, TARGET_BIBLE,
} from '../js/common/constants';

describe('settingsMigrationHelpers.migrateToLanguageAwareCurrentPaneSettings', () => {
  test('migrateToLanguageAwareCurrentPaneSettings migrates string currentPaneSettings to objects pane settings', () => {
    const currentPaneSettings = ['ulb', 'ugnt', TARGET_LANGUAGE];
    const newCurrentPaneSettings = settingsMigrationHelpers.migrateToLanguageAwareCurrentPaneSettings(currentPaneSettings);
    const expectedResult = [
      {
        languageId: 'en',
        bibleId: 'ulb',
      },
      {
        languageId: ORIGINAL_LANGUAGE,
        bibleId: 'ugnt',
      },
      {
        languageId: TARGET_LANGUAGE,
        bibleId: TARGET_BIBLE,
      },
    ];
    expect(newCurrentPaneSettings).toEqual(expectedResult);
  });
});
