import { combineReducers } from 'redux';
// List of reducers
import { localizeReducer as localize } from 'react-localize-redux';
import toolsReducer from './toolsReducer';
import modalReducer from './modalReducer';
import loginReducer from './loginReducer';
import recentProjectsReducer from './recentProjectsReducer';
import importOnlineReducer from './importOnlineReducer';
import groupMenuReducer from './groupMenuReducer';// TODO
import settingsReducer from './settingsReducer';
import popoverReducer from './popoverReducer';
import resourcesReducer from './resourcesReducer';
import projectDetailsReducer from './projectDetailsReducer';
import alertModalReducer from './alertModalReducer';
// import commentsReducer from './commentsReducer';// TODO
import selectionsReducer from './selectionsReducer';// TODO
// import remindersReducer from './remindersReducer';// TODO
// import invalidatedReducer from './invalidatedReducer';// TODO
import contextIdReducer from './contextIdReducer';// TODO
import groupsDataReducer from './groupsDataReducer';// TODO
import groupsIndexReducer from './groupsIndexReducer';// TODO
// import verseEditReducer from './verseEditReducer';// TODO
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
  groupMenuReducer,// TODO
  popoverReducer,
  resourcesReducer,
  projectDetailsReducer,
  alertModalReducer,
  // commentsReducer,// TODO
  selectionsReducer,// TODO
  // remindersReducer,// TODO
  // invalidatedReducer,
  contextIdReducer,// TODO
  groupsDataReducer,// TODO
  groupsIndexReducer,// TODO
  // verseEditReducer,// TODO
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
