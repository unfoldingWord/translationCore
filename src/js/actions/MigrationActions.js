import fs from 'fs-extra';
import path from 'path-extra';
// actions
import * as SettingsActions from './SettingsActions';
// constants
const USER_RESOURCES_PATH = path.join(path.homedir(), 'translationCore/resources');
const PARENT = path.datadir('translationCore');
const SETTINGS_DIRECTORY = path.join(PARENT, 'settings.json');

export function migrateResourcesFolder() {
  return (() => {
    // remove resources folder from tC user directory so that it is regenerated.
    fs.removeSync(USER_RESOURCES_PATH)
  })
}

/**
 * @description migrates the toolsSettings to use 'ulb' in the currentPaneSettings instead of 'ulb-en'
 */
export function migrateToolsSettings() {
  return ((dispatch) => {
    if (fs.existsSync(SETTINGS_DIRECTORY)) {
      let settings = fs.readJsonSync(SETTINGS_DIRECTORY);
      if (settings.toolsSettings.ScripturePane && settings.toolsSettings.ScripturePane.currentPaneSettings.includes('ulb-en')) {
        let newCurrentPaneSettings = settings.toolsSettings.ScripturePane.currentPaneSettings.map((bibleId) => {
          switch (bibleId) {
            case 'ulb-en':
              return 'ulb';
            case 'udb-en':
              return 'udb';
            default:
              return bibleId
          }
        });
        dispatch(SettingsActions.setToolSettings("ScripturePane", "currentPaneSettings", newCurrentPaneSettings));
      }
    }
  });
}