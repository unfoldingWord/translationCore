import fs from 'fs-extra';
import path from 'path-extra';
import ospath from 'ospath';
// actions
import * as SettingsActions from './SettingsActions';
// constants
const USER_RESOURCES_PATH = path.join(ospath.home(), 'translationCore/resources');
const PARENT = path.datadir('translationCore');
const SETTINGS_DIRECTORY = path.join(PARENT, 'settings.json');

export function migrateResourcesFolder() {
  return (() => {
    // remove resources folder from tC user directory so that it is regenerated.
    fs.removeSync(USER_RESOURCES_PATH);
  });
}

/**
 * @description migrates the toolsSettings to use 'ulb' in the currentPaneSettings instead of 'ulb-en'
 */
export function migrateToolsSettings() {
  return ((dispatch) => {
    if (fs.existsSync(SETTINGS_DIRECTORY)) {
      dispatch(migrateCurrentPaneSettings1());
      dispatch(migrateCurrentPaneSettings2());
      dispatch(migrateCurrentPaneSettings3());
    }
  });
}


function migrateCurrentPaneSettings1() {
  return ((dispatch, getState) => {
    const settings = getState().settingsReducer;
    const currentPaneSettings = settings.toolsSettings.ScripturePane.currentPaneSettings;

    if (settings.toolsSettings.ScripturePane && currentPaneSettings.includes('ulb-en')) {
      let newCurrentPaneSettings = currentPaneSettings.map((bibleId) => {
        switch (bibleId) {
          case 'ulb-en':
            return 'ulb';
          case 'udb-en':
            return 'udb';
          default:
            return bibleId;
        }
      });
      dispatch(SettingsActions.setToolSettings("ScripturePane", "currentPaneSettings", newCurrentPaneSettings));
    }
  });
}

/**
 * Update bhp references to ugnt.
 * @return action.
 */
function migrateCurrentPaneSettings2() {
  return ((dispatch, getState) => {
    const settings = getState().settingsReducer;
    const currentPaneSettings = settings.toolsSettings.ScripturePane.currentPaneSettings;

    if (settings.toolsSettings.ScripturePane && currentPaneSettings.includes('bhp')) {
      let newCurrentPaneSettings = currentPaneSettings.map((bibleId) => {
        if (bibleId === 'bhp') {
          return 'ugnt';
        } else {
          return bibleId;
        }
      });
      dispatch(SettingsActions.setToolSettings("ScripturePane", "currentPaneSettings", newCurrentPaneSettings));
    }
  });
}

function migrateCurrentPaneSettings3() {
  return ((dispatch, getState) => {
    const settings = getState().settingsReducer;
    const currentPaneSettings = settings.toolsSettings.ScripturePane.currentPaneSettings;
    // if any value in the current pane settings is a string then its an old current pane settings.
    const foundCurrentPaneSettings = currentPaneSettings.filter((paneSettings) => typeof paneSettings === 'string' && typeof paneSettings !== 'object');
    if (foundCurrentPaneSettings.length > 0) {
      const newCurrentPaneSettings = migrateToLanguageAwareCurrentPaneSettings(currentPaneSettings);
      dispatch(SettingsActions.setToolSettings("ScripturePane", "currentPaneSettings", newCurrentPaneSettings));
    }
  });
}

/**
 * This function migrates the current pane settings from being an array of
 * string bibleIds to now an object that includes both languageIds and bibleIds.
 * @example
 * {
 *  languageId: "en",
 *  bibleId: "ulb"
 * }
 * @param {Array} currentPaneSettings - array of current pane settings.
 */
function migrateToLanguageAwareCurrentPaneSettings(currentPaneSettings) {
  const newCurrentPaneSettings = currentPaneSettings.map((bibleId) => {
    let languageId;
    switch (bibleId) {
      case 'ugnt':
      case 'uhb':
        languageId = 'originalLanguage';
        break;
      case 'ulb':
      case 'udb':
        languageId = 'en';
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
