import { combineReducers } from 'redux'
//List of reducers
import coreStoreReducer from './coreStoreReducer'
import modalReducers from './modalReducers'
import newModalReducer from './newModalReducer'
import loginReducer from './loginReducer'
import settingsReducer from './settingsReducer'
import dragDropReducer from './dragDropReducer'
import toolsReducer from './toolsReducer'
import recentProjectsReducer from './recentProjectsReducer'
import importOnlineReducer from './importOnlineReducer'
import reportsReducer from './reportsReducer'
import checkStoreReducer from './checkStoreReducer'
import sideBarReducer from './sideBarReducer'
import statusBarReducer from './statusBarReducer'
import loaderReducer from './loaderReducer'
import notificationsReducer from './notificationsReducer'
import popoverReducer from './popoverReducer'
import resourcesReducer from './resourcesReducer'
import projectDetailsReducer from './projectDetailsReducer'
import alertModalReducer from './alertModalReducer'

//combining reducers
const rootReducers = combineReducers({
  coreStoreReducer,
  modalReducers,
  newModalReducer,
  loginReducer,
  settingsReducer,
  dragDropReducer,
  toolsReducer,
  recentProjectsReducer,
  importOnlineReducer,
  reportsReducer,
  checkStoreReducer,
  sideBarReducer,
  statusBarReducer,
  loaderReducer,
  notificationsReducer,
  popoverReducer,
  resourcesReducer,
  projectDetailsReducer,
  alertModalReducer
})

export default rootReducers
