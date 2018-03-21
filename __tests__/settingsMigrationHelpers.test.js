import * as settingsMigrationHelpers from '../src/js/helpers/settingsMigrationHelpers';

describe('settingsMigrationHelpers.migrateToLanguageAwareCurrentPaneSettings', () => {
   test('migrateToLanguageAwareCurrentPaneSettings migrates string currentPaneSettings to objects pane settings', () => {
    const currentPaneSettings = ['ulb', 'ugnt', 'targetLanguage'];
    const newCurrentPaneSettings = settingsMigrationHelpers.migrateToLanguageAwareCurrentPaneSettings(currentPaneSettings);
    const expectedResult = [
      {
        languageId: 'en',
        bibleId: 'ulb'
      },
      {
        languageId: 'originalLanguage',
        bibleId: 'ugnt'
      },
      {
        languageId: 'targetLanguage',
        bibleId: 'targetBible'
      }
    ];
    expect(newCurrentPaneSettings).toEqual(expectedResult);
   });
});
