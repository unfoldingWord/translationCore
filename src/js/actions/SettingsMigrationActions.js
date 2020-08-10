import fs from 'fs-extra';
import path from 'path-extra';
import env from 'tc-electron-env';
// actions
// helpers
import * as settingsMigrationHelpers from '../helpers/settingsMigrationHelpers';
import * as Bible from '../common/BooksOfTheBible';
import * as SettingsActions from './SettingsActions';
// constants
const PARENT = path.join(env.data(), 'translationCore', 'projects');
const SETTINGS_DIRECTORY = path.join(PARENT, 'settings.json');

/**
 * Migrates the scripture pane bible settings.
 */
export function migrateToolsSettings() {
  return ((dispatch) => {
    if (fs.existsSync(SETTINGS_DIRECTORY)) {
      dispatch(migrateCurrentPaneSettings1());
      dispatch(migrateCurrentPaneSettings2());
      dispatch(migrateCurrentPaneSettings3());
      dispatch(migrateCurrentPaneSettings4());
    }
  });
}

/**
 * Migrates the toolsSettings to use 'ult' in the currentPaneSettings instead of 'ulb-en'
 */
export function migrateCurrentPaneSettings1() {
  return ((dispatch, getState) => {
    const toolsSettings = getState().settingsReducer.toolsSettings;
    const { ScripturePane } = toolsSettings;
    const currentPaneSettings = ScripturePane && ScripturePane.currentPaneSettings ?
      ScripturePane.currentPaneSettings : null;

    if (ScripturePane && currentPaneSettings && currentPaneSettings.includes('ulb-en')) {
      let newCurrentPaneSettings = currentPaneSettings.map((bibleId) => {
        switch (bibleId) {
        case 'ulb-en':
          return 'ult';
        case 'udb-en':
        case 'udt':
          return 'ust';
        default:
          return bibleId;
        }
      });
      dispatch(SettingsActions.setToolSettings('ScripturePane', 'currentPaneSettings', newCurrentPaneSettings));
    }
  });
}

/**
 * Update bhp references to ugnt.
 */
export function migrateCurrentPaneSettings2() {
  return ((dispatch, getState) => {
    const toolsSettings = getState().settingsReducer.toolsSettings;
    const { ScripturePane } = toolsSettings;
    const currentPaneSettings = ScripturePane && ScripturePane.currentPaneSettings ?
      ScripturePane.currentPaneSettings : null;

    if (ScripturePane && currentPaneSettings && currentPaneSettings.includes('bhp')) {
      let newCurrentPaneSettings = currentPaneSettings.map((bibleId) => {
        if (bibleId === 'bhp') {
          return Bible.NT_ORIG_LANG_BIBLE;
        } else {
          return bibleId;
        }
      });
      dispatch(SettingsActions.setToolSettings('ScripturePane', 'currentPaneSettings', newCurrentPaneSettings));
    }
  });
}

/**
 * Migrate the current pane settings from being an array of string bibleIds
 * to now an object that includes both languageIds and bibleIds.
 */
export function migrateCurrentPaneSettings3() {
  return ((dispatch, getState) => {
    const toolsSettings = getState().settingsReducer.toolsSettings;
    const { ScripturePane } = toolsSettings;
    const currentPaneSettings = ScripturePane && ScripturePane.currentPaneSettings ?
      ScripturePane.currentPaneSettings : null;

    if (ScripturePane && currentPaneSettings) {
      // if any value in the current pane settings is a string then its an old current pane settings.
      const foundCurrentPaneSettings = currentPaneSettings.filter((paneSettings) => typeof paneSettings === 'string' && typeof paneSettings !== 'object');

      if (foundCurrentPaneSettings.length > 0) {
        const newCurrentPaneSettings = settingsMigrationHelpers.migrateToLanguageAwareCurrentPaneSettings(currentPaneSettings);
        dispatch(SettingsActions.setToolSettings('ScripturePane', 'currentPaneSettings', newCurrentPaneSettings));
      }
    }
  });
}

/**
 * Migrates the scripture pane bible settings to use ult for
 * English and ulb for Hindi and uses udt instead of udb.
 */
export function migrateCurrentPaneSettings4() {
  return ((dispatch, getState) => {
    const toolsSettings = getState().settingsReducer.toolsSettings;
    const { ScripturePane } = toolsSettings;
    const currentPaneSettings = ScripturePane && ScripturePane.currentPaneSettings ?
      ScripturePane.currentPaneSettings : null;

    if (ScripturePane && currentPaneSettings) {
      const foundUlbOrUltBibleIdCondition = (paneSettings) => paneSettings.bibleId === 'ulb' || paneSettings.bibleId === 'ult' || paneSettings.bibleId === 'udb';
      const foundUlbOrUltBibleId = currentPaneSettings.find((paneSettings) => foundUlbOrUltBibleIdCondition(paneSettings));

      if (foundUlbOrUltBibleId) {
        const newCurrentPaneSettings = currentPaneSettings.map((paneSettings) => {
          if (paneSettings.bibleId === 'ult' && paneSettings.languageId === 'hi') {
            paneSettings.bibleId = 'ulb';
          }

          if (paneSettings.bibleId === 'udt' && paneSettings.languageId === 'en') {
            paneSettings.bibleId = 'ust';
          }

          if (paneSettings.bibleId === 'udb' && paneSettings.languageId === 'hi') {
            paneSettings.bibleId = 'udt';
          }

          return paneSettings;
        });
        dispatch(SettingsActions.setToolSettings('ScripturePane', 'currentPaneSettings', newCurrentPaneSettings));
      }
    }
  });
}
