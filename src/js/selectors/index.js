/**
 * This contains the state selectors.
 * These selectors receive a slice of the state
 * applicable to the reducer in question.
 */

import * as reducers from '../reducers';

/**
 * Retrieves an application setting
 * @param state
 * @param key
 * @return {*}
 */
export const getSetting = (state, key) =>
  reducers.settingsReducer.getSetting(state.settingsReducer, key);

/**
 * Returns a list of loaded languages available for the app locale.
 * This is a wrapper around react-localize-redux
 * @param state
 * @return {Language[]}
 */
export const getLocaleLanguages = (state) =>
  reducers.localeSettings.getLanguages(state);

/**
 * Returns the currently active app locale.
 * This is a wrapper around react-localize-redux
 * @param state
 * @return {Language}
 */
export const getActiveLocaleLanguage = (state) =>
  reducers.localeSettings.getActiveLanguage(state);

/**
 * Checks if the locale has finished loading
 * @param state
 * @return {*}
 */
export const getLocaleLoaded = (state) =>
  reducers.localeSettings.getLocaleLoaded(state.localeSettings);

/**
 * Checks if the locale settings screen is open
 * @param state
 * @return {*}
 */
export const getLocaleSettingsOpen = (state) =>
  reducers.localeSettings.getLocaleSettingsOpen(state.localeSettings);

/**
 * Returns the current step of the home screen
 * @param state
 * @return {int}
 */
export const getHomeScreenStep = (state) =>
  reducers.homeScreenReducer.getStep(state.homeScreenReducer);
