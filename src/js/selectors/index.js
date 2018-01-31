/**
 * This module contains the state selectors.
 * These selectors receive a slice of the state
 * applicable to the reducer in question.
 */

import * as fromSettingsReducer from '../reducers/settingsReducer';
import * as fromLocaleSettings from '../reducers/localeSettings';
import * as fromHomeScreenReducer from '../reducers/homeScreenReducer';
import * as fromLoginReducer from '../reducers/loginReducer';
import * as fromProjectDetailsReducer from '../reducers/projectDetailsReducer';
import * as fromSelectionsReducer from '../reducers/selectionsReducer';

/**
 * Retrieves an application setting
 * @param {object} state
 * @param key
 * @return {*}
 */
export const getSetting = (state, key) =>
  fromSettingsReducer.getSetting(state.settingsReducer, key);

/**
 * Returns a list of loaded languages available for the app locale.
 * This is a wrapper around react-localize-redux
 * @param {object} state
 * @return {Language[]}
 */
export const getLocaleLanguages = (state) =>
  fromLocaleSettings.getLanguages(state);

/**
 * Returns the currently active app locale.
 * This is a wrapper around react-localize-redux
 * @param {object} state
 * @return {Language}
 */
export const getActiveLocaleLanguage = (state) =>
  fromLocaleSettings.getActiveLanguage(state);

/**
 * Checks if the locale has finished loading
 * @param {object} state
 * @return {bool}
 */
export const getLocaleLoaded = (state) =>
  fromLocaleSettings.getLocaleLoaded(state.localeSettings);

/**
 * Checks if the locale settings screen is open
 * @param {object} state
 * @return {bool}
 */
export const getLocaleSettingsOpen = (state) =>
  fromLocaleSettings.getLocaleSettingsOpen(state.localeSettings);

/**
 * @deprecated you probably shouldn't use this.
 * This was added to make it easier to localize old code.
 *
 * Retrieves the translate function.
 * This is a wrapper that encapsulates the translate reducer.
 *
 * @param {object} state
 * @return {*}
 */
export const getTranslate = (state) =>
  fromLocaleSettings.getTranslate(state);

/**
 * Returns the current step of the home screen
 * @param {object} state
 * @return {int}
 */
export const getHomeScreenStep = (state) =>
  fromHomeScreenReducer.getStep(state.homeScreenReducer);

/**
 * Returns the current step of the home screen
 * @param {object} state
 * @return {int}
 */
export const getNextHomeScreenStepDisabled = (state) =>
  fromHomeScreenReducer.getIsNextStepDisabled(state.homeScreenReducer);

/**
 * Returns a list of home screen steps that are active
 * @param {object} state
 * @return {boolean[]}
 */
export const getActiveHomeScreenSteps = (state) => {
  const loggedIn = getIsUserLoggedIn(state);
  const projectSaveLocation = getProjectSaveLocation(state);
  return fromHomeScreenReducer.getActiveSteps(loggedIn, projectSaveLocation);
};

/**
 * Checks if the user is logged in
 * @param {object} state
 * @return {bool}
 */
export const getIsUserLoggedIn = (state) =>
  fromLoginReducer.getIsLoggedIn(state.loginReducer);

/**
 * Returns the username of the user
 * @param {object} state
 * @return {string}
 */
export const getUsername = (state) =>
  fromLoginReducer.getUsername(state.loginReducer);

/**
 * Returns the save location of the project
 * @param {object} state
 * @return {string}
 */
export const getProjectSaveLocation = (state) =>
  fromProjectDetailsReducer.getSaveLocation(state.projectDetailsReducer);

/**
 * Returns the manifest of the project
 * @param {object} state
 * @return {object}
 */
export const getProjectManifest = (state) =>
  fromProjectDetailsReducer.getManifest(state.projectDetailsReducer);

/**
 * Retrieves selections.
 * This needs better documentation. What are selections?
 * @param {object} state
 * @return {list}
 */
export const getSelections = (state) =>
  fromSelectionsReducer.getSelections(state.selectionsReducer);
