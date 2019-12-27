import { combineReducers } from 'redux';
// List of reducers
import { localizeReducer as localize } from 'react-localize-redux';
import toolsReducer from './toolsReducer';
import modalReducer from './modalReducer';
import loginReducer from './loginReducer';
import recentProjectsReducer from './recentProjectsReducer';
import importOnlineReducer from './importOnlineReducer';
import groupMenuReducer from './groupMenuReducer';
import settingsReducer from './settingsReducer';
import popoverReducer from './popoverReducer';
import resourcesReducer from './resourcesReducer';
import projectDetailsReducer from './projectDetailsReducer';
import alertModalReducer from './alertModalReducer';
import commentsReducer from './commentsReducer';
import selectionsReducer from './selectionsReducer';
import remindersReducer from './remindersReducer';
import invalidatedReducer from './invalidatedReducer';
import contextIdReducer from './contextIdReducer';
import groupsDataReducer from './groupsDataReducer';
import groupsIndexReducer from './groupsIndexReducer';
import verseEditReducer from './verseEditReducer';
import homeScreenReducer from './homeScreenReducer';
import myProjectsReducer from './myProjectsReducer';
import projectValidationReducer from './projectValidationReducer';
import copyrightCheckReducer from './copyrightCheckReducer';
import projectInformationCheckReducer from './projectInformationCheckReducer';
import mergeConflictReducer from './mergeConflictReducer';
import missingVersesReducer from './missingVersesReducer';
import localImportReducer from './localImportReducer';
import sourceContentUpdatesReducer from './sourceContentUpdatesReducer';
import softwareUpdateReducer from './softwareUpdateReducer';
import localeSettings from './localeSettings';
import alerts from './alerts';

// combining reducers
const rootReducers = combineReducers({
  localize,
  alerts,
  localeSettings,
  toolsReducer,
  modalReducer,
  loginReducer,
  settingsReducer,
  recentProjectsReducer,
  importOnlineReducer,
  groupMenuReducer,
  popoverReducer,
  resourcesReducer,
  projectDetailsReducer,
  alertModalReducer,
  commentsReducer,
  selectionsReducer,
  remindersReducer,
  invalidatedReducer,
  contextIdReducer,
  groupsDataReducer,
  groupsIndexReducer,
  verseEditReducer,
  homeScreenReducer,
  myProjectsReducer,
  projectValidationReducer,
  copyrightCheckReducer,
  projectInformationCheckReducer,
  mergeConflictReducer,
  missingVersesReducer,
  localImportReducer,
  sourceContentUpdatesReducer,
  softwareUpdateReducer,
});

export default rootReducers;
