import { combineReducers } from 'redux'
// List of reducers
import coreStoreReducer from './coreStoreReducer'
import modalReducer from './modalReducer'
import loginReducer from './loginReducer'
import toolsReducer from './toolsReducer'
import recentProjectsReducer from './recentProjectsReducer'
import importOnlineReducer from './importOnlineReducer'
import groupMenuReducer from './groupMenuReducer'
import settingsReducer from './settingsReducer'
import loaderReducer from './loaderReducer'
import popoverReducer from './popoverReducer'
import resourcesReducer from './resourcesReducer'
import projectDetailsReducer from './projectDetailsReducer'
import alertModalReducer from './alertModalReducer'
import commentsReducer from './commentsReducer'
import selectionsReducer from './selectionsReducer'
import remindersReducer from './remindersReducer'
import contextIdReducer from './contextIdReducer'
import groupsDataReducer from './groupsDataReducer'
import groupsIndexReducer from './groupsIndexReducer'
import verseEditReducer from './verseEditReducer'
import modulesSettingsReducer from './modulesSettingsReducer'
import currentToolReducer from './currentToolReducer'
import homeScreenReducer from './homeScreenReducer'
// combining reducers
const rootReducers = combineReducers({
  coreStoreReducer,
  modalReducer,
  loginReducer,
  settingsReducer,
  toolsReducer,
  recentProjectsReducer,
  importOnlineReducer,
  groupMenuReducer,
  loaderReducer,
  popoverReducer,
  resourcesReducer,
  projectDetailsReducer,
  alertModalReducer,
  commentsReducer,
  selectionsReducer,
  remindersReducer,
  contextIdReducer,
  groupsDataReducer,
  groupsIndexReducer,
  verseEditReducer,
  modulesSettingsReducer,
  currentToolReducer,
  homeScreenReducer
});

export default rootReducers;
