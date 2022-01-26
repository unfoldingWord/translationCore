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
import * as fromProjectValidationReducer
  from '../reducers/projectValidationReducer';
import * as fromToolsReducer from '../reducers/toolsReducer';
import * as fromResourcesReducer from '../reducers/resourcesReducer';
import * as fromAlertModalReducer from '../reducers/alertModalReducer';
import * as fromProjectInformationCheckReducer from '../reducers/projectInformationCheckReducer';
import * as fromSourceContentUpdatesReducer from '../reducers/sourceContentUpdatesReducer';
import * as fromMyProjectsReducer from '../reducers/myProjectsReducer';
import * as fromAlert from '../reducers/alerts';
import * as fromSoftwareUpdateReducer from '../reducers/softwareUpdateReducer';
import { DEFAULT_OWNER } from '../common/constants';

/**
 * checks if the software update dialog is open
 * @param state
 * @return {boolean}
 */
export const getIsSoftwareUpdateOpen = state =>
  fromSoftwareUpdateReducer.getIsOpen(state.softwareUpdateReducer);

/**
 * Retrieves active alerts
 * @param state
 */
export const getAlerts = state =>
  fromAlert.getAlerts(state.alerts);

/**
 * Returns a list of the user's projects.
 * @param state
 * @return {object[]}
 */
export const getProjects = state =>
  fromMyProjectsReducer.getProjects(state.myProjectsReducer);

/**
 * Checks if the alert dialog is open
 * @param state
 * @return {boolean}
 */
export const getAlertIsOpen = state =>
  fromAlertModalReducer.getAlertIsOpen(state.alertModalReducer);

/**
 * Returns the title of the currently selected tool.
 * @param state
 * @return {string}
 */
export const getSelectedToolTitle = state =>
  fromToolsReducer.getSelectedToolTitle(state.toolsReducer);

/**
 * Returns an array of tools that can be used in the app
 * @param state
 * @returns {object[]}
 */
export const getTools = state =>
  fromToolsReducer.getTools(state.toolsReducer);

/**
 * Returns an object of tools that can be used in the app
 * @param state
 * @returns {object[]}
 */
export const getToolsByKey = state =>
  fromToolsReducer.getToolsByKey(state.toolsReducer);

/**
 * Returns an array of tool names
 * @param state
 * @returns {*}
 */
export const getToolNames = state =>
  fromToolsReducer.getNames(state.toolsReducer);

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
 * Checks if the next step of the home screen is disabled
 * @param {object} state
 * @return {boolean}
 */
export const getNextHomeScreenStepDisabled = (state) => {
  const loggedIn = getIsUserLoggedIn(state);
  const projectSaveLocation = getProjectSaveLocation(state);
  return fromHomeScreenReducer.getIsNextStepDisabled(state.homeScreenReducer,
    loggedIn, !!projectSaveLocation);
};

/**
 * Returns a list of home screen steps that are active
 * @param {object} state
 * @return {boolean[]}
 */
export const getActiveHomeScreenSteps = (state) => {
  const loggedIn = getIsUserLoggedIn(state);
  const projectSaveLocation = getProjectSaveLocation(state);
  return fromHomeScreenReducer.getActiveSteps(loggedIn, !!projectSaveLocation);
};

/**
 * gets the error message to attach to feedback dialog (also used as flag to show feedback dialog)
 * @param {object} state
 * @return {String}
 */
export const getErrorFeedbackMessage = (state) => fromHomeScreenReducer.getErrorFeedbackMessage(state.homeScreenReducer);

/**
 * gets additional error details to provide feedback dialog submission
 * @param {object} state
 * @return {String}
 */
export const getErrorFeedbackExtraDetails = (state) => fromHomeScreenReducer.getErrorFeedbackExtraDetails(state.homeScreenReducer);

/**
 * gets the category for error feedback dialog)
 * @param {object} state
 * @return {String}
 */
export const getErrorFeedbackCategory = (state) => fromHomeScreenReducer.getErrorFeedbackCategory(state.homeScreenReducer);

/**
 * gets the function to call when feedback dialog closes
 * @param {object} state
 * @return {String}
 */
export const getFeedbackCloseCallback = (state) => fromHomeScreenReducer.getFeedbackCloseCallback(state.homeScreenReducer);

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
 * Returns the email of the user
 * @param {object} state
 * @return {string}
 */
export const getUserEmail = (state) =>
  fromLoginReducer.getEmail(state.loginReducer);

/**
 * Returns the book id of the selected project
 * @param state
 * @returns {string}
 */
export const getProjectBookId = state =>
  fromProjectDetailsReducer.getBookId(state.projectDetailsReducer);

/**
 * Returns the gateway language selected for the given tool.
 * @param state
 * @param {string} toolName - the name of the tool
 * @returns {*}
 */
export const getToolGatewayLanguage = (state, toolName) =>
  fromProjectDetailsReducer.getToolGatewayLanguage(state.projectDetailsReducer, toolName);

/**
 * Returns the save location of the project
 * @param {object} state
 * @return {string}
 */
export const getProjectSaveLocation = (state) =>
  fromProjectDetailsReducer.getSaveLocation(state.projectDetailsReducer);

/**
 * Returns the nickname of the selected project
 * @param state
 * @return {string}
 */
export const getProjectNickname = state =>
  fromProjectDetailsReducer.getNickname(state.projectDetailsReducer);

/**
 * Returns the name of the selected project
 * @param state
 * @return {*}
 */
export const getProjectName = (state) =>
  fromProjectDetailsReducer.getName(state.projectDetailsReducer);

/**
 * Returns the manifest of the project
 * @param {object} state
 * @return {object}
 */
export const getProjectManifest = (state) =>
  fromProjectDetailsReducer.getManifest(state.projectDetailsReducer);

/**
 * Returns the settings of the project
 * @param {object} state
 * @return {object}
 */
export const getProjectSettings = (state) =>
  fromProjectDetailsReducer.getSettings(state.projectDetailsReducer);

/**
 * Returns the current step of the project validation screen
 * @param {object} state
 * @return {int}
 */
export const getProjectValidationStep = (state) =>
  fromProjectValidationReducer.getStep(state.projectValidationReducer);

/**
 * Checks if the next project validation step is disabled
 * @param {object} state
 * @return {boolean}
 */
export const getNextProjectValidationStepDisabled = (state) =>
  fromProjectValidationReducer.getIsNextStepDisabled(
    state.projectValidationReducer);

/**
 * Checks if only the project validation screen should be shown
 * @param {Object} state
 * @return {boolean}
 */
export const getShowProjectInformationScreen = (state) =>
  fromProjectValidationReducer.getShowProjectInformationScreen(
    state.projectValidationReducer);

/**
 * checks to see if we should show overwrite on save button
 * @param {Object} state
 * @return {boolean}
 */
export const getShowOverwriteWarning = (state) =>
  fromProjectValidationReducer.getShowOverwriteWarning(
    state.projectValidationReducer);

/**
 * checks to see if we should show overwrite on save button
 * @param {Object} state
 * @return {boolean}
 */
export const getIsOverwritePermitted = (state) =>
  fromProjectInformationCheckReducer.getIsOverwritePermitted(
    state.projectInformationCheckReducer);

/**
 * Gets the currently selected tool
 * @param {Object} state
 * @return {String | undefined}
 */
export const getCurrentToolName = state =>
  fromToolsReducer.getCurrentToolName(state.toolsReducer);

/**
 * Returns the tool selected by the user
 * @param state
 * @returns {*}
 */
export const getSelectedTool = state =>
  fromToolsReducer.getSelectedTool(state.toolsReducer);

/**
 * Returns an api for the current tool if it has one.
 * @param state
 * @return {ApiController|null}
 */
export const getSelectedToolApi = state =>
  fromToolsReducer.getSelectedToolApi(state.toolsReducer);

/**
 * Returns supporting tool apis.
 * This will not include the api for the current tool.
 * For the current tool's api use {@link getSelectedToolApi}
 * @param state
 * @return {ApiController[]}
 */
export const getSupportingToolApis = state =>
  fromToolsReducer.getSupportingToolApis(state.toolsReducer);

/**
 * Return the selected tool's view
 * @param state
 * @return {*}
 */
export const getSelectedToolContainer = state =>
  fromToolsReducer.getSelectedToolContainer(state.toolsReducer);

/**
 * Returns the target language bible
 * @param state
 * @return {*}
 */
export const getTargetBook = state =>
  fromResourcesReducer.getTargetBook(state.resourcesReducer);

/**
 * Returns the source language bible
 * @param state
 * @param owner
 * @return {*}
 */
export const getSourceBook = (state, owner = DEFAULT_OWNER) =>
  fromResourcesReducer.getSourceBook(state.resourcesReducer, owner);

/**
 * Checks if the home screen is visible
 * @param state
 * @return {boolean}
 */
export const getIsHomeVisible = state =>
  fromHomeScreenReducer.getIsHomeVisible(state.homeScreenReducer);

/**
 * Retrieves selections.
 * This needs better documentation. What are selections?
 * @param {object} state
 * @return {list}
 */
export const getListOfOutdatedSourceContent = (state) =>
  fromSourceContentUpdatesReducer.getListOfOutdatedSourceContent(state.sourceContentUpdatesReducer);

/**
 * Returns the count of source content updates this session.  This can be used to see if dependencies on source content
 *  need to be updated by checking if count has changed.
 * @param {object} state
 * @returns {Number} count of source content updates this session
 */
export const getSourceContentUpdateCount = (state) =>
  fromSourceContentUpdatesReducer.getSourceContentUpdateCount(state.sourceContentUpdatesReducer);

/**
 * Returns the selected tool categories for the selected project
 * @param state
 * @param toolName
 * @returns {*}
 */
export const getToolCategories = (state, toolName) =>
  fromProjectDetailsReducer.getToolCategories(state.projectDetailsReducer, toolName);

/**
 * Returns the progress of a tool for the selected project
 * @deprecated
 * @param state
 * @param toolName
 * @returns {*}
 */
export const getProjectToolProgress = (state, toolName) =>
  fromProjectDetailsReducer.getToolProgress(state.projectDetailsReducer, toolName);

export const getToolsSelectedGLs = (state) =>
  fromProjectDetailsReducer.getToolsSelectedGLs(state.projectDetailsReducer);

export const getToolsSelectedOwners = (state) =>
  fromProjectDetailsReducer.getToolsSelectedOwners(state.projectDetailsReducer);


// export const getGroupsIndex = (state) =>
//   fromGroupsIndex.getGroupsIndex(state.groupsIndexReducer);

// export const getGroupsData = (state) =>
//   fromGroupsData.getGroupsData(state.groupsDataReducer);

export const getBibles = (state) =>
  fromResourcesReducer.getBibles(state.resourcesReducer);

/**
 * Returns the manifest for the source language book.
 * @param state
 * @param owner
 * @returns {object}
 */
export const getSourceBookManifest = (state, owner) =>
  fromResourcesReducer.getSourceBookManifest(state.resourcesReducer, owner);
