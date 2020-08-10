import { combineReducers } from 'redux';
// List of reducers
import { localizeReducer as localize } from 'react-localize-redux';
import { confirmationReducer } from '../middleware/confirmation/confirmationMiddleware';
import toolsReducer from './toolsReducer';
import modalReducer from './modalReducer';
import loginReducer from './loginReducer';
import recentProjectsReducer from './recentProjectsReducer';
import importOnlineReducer from './importOnlineReducer';
import settingsReducer from './settingsReducer';
import popoverReducer from './popoverReducer';
import resourcesReducer from './resourcesReducer';
import projectDetailsReducer from './projectDetailsReducer';
import alertModalReducer from './alertModalReducer';
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
  popoverReducer,
  resourcesReducer,
  projectDetailsReducer,
  alertModalReducer,
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
  confirm: confirmationReducer,
});

export default rootReducers;
