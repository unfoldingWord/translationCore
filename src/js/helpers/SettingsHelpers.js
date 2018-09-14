/**
 * gets the list of books in scripture pane
 * @param {Object} state
 * @return {Array}
 */
export function getCurrentPaneSetting(state) {
  const settingsReducer = state.settingsReducer;
  const currentPaneSettings = settingsReducer && settingsReducer.toolsSettings &&
    settingsReducer.toolsSettings.ScripturePane && settingsReducer.toolsSettings.ScripturePane.currentPaneSettings;
  return currentPaneSettings;
}

