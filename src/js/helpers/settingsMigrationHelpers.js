
/**
 * This function migrates the current pane settings from being an array of
 * string bibleIds to an object that includes both languageIds and bibleIds.
 * @example
 * {
 *  languageId: "en",
 *  bibleId: "ulb"
 * }
 * @param {Array} currentPaneSettings - array of current pane settings.
 */
export function migrateToLanguageAwareCurrentPaneSettings(currentPaneSettings) {
  const newCurrentPaneSettings = currentPaneSettings.map((bibleId) => {
    let languageId;
    switch (bibleId) {
      case 'ugnt':
      case 'uhb':
        languageId = 'originalLanguage';
        break;
      case 'ulb':
      case 'ult':
      case 'udb':
      case 'udt':
        languageId = 'en';
        break;
      case 'targetLanguage':
        languageId = 'targetLanguage';
        bibleId = 'targetBible';
        break;
      default:
      console.error(`${bibleId} is not found in the switch statement in migrateToLanguageAwareCurrentPaneSettings`);
        break;
    }
    const paneSetting = new Object();
    paneSetting.languageId = languageId;
    paneSetting.bibleId = bibleId;

    return paneSetting;
  });
  return newCurrentPaneSettings;
}
