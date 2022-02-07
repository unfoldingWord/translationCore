import { DEFAULT_OWNER } from '../common/constants';

/**
 * gets the list of books in scripture pane
 * @param {Object} state
 * @return {Array}
 */
export function getCurrentPaneSetting(state) {
  const settingsReducer = state.settingsReducer;
  const currentPaneSettings = settingsReducer && settingsReducer.toolsSettings &&
    settingsReducer.toolsSettings.ScripturePane && settingsReducer.toolsSettings.ScripturePane.currentPaneSettings;

  if (currentPaneSettings) {
    return currentPaneSettings.map(paneSetting => {
      if (!paneSetting.owner) { // if not set, use default
        const owner = DEFAULT_OWNER;
        return {
          ...paneSetting,
          owner,
        };
      }
      return paneSetting;
    });
  }
  return currentPaneSettings;
}

