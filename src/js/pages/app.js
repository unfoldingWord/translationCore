import React from 'react';
import ReactDOM from 'react-dom';
import CoreActions from '../actions/CoreActions.js';
import recentProjectActions from '../actions/RecentProjectsActions.js';
import CoreActionsRedux from '../actions/CoreActionsRedux.js';
import modalActions from '../actions/ModalActions.js';
import CheckStore from '../stores/CheckStore.js';
import { connect } from 'react-redux';
import pathex from 'path-extra';
let PARENT = pathex.datadir('translationCore');
let PACKAGE_SUBMODULE_LOCATION = pathex.join(window.__base, 'tC_apps');
import bootstrap from 'react-bootstrap';
import CryptoJS from "crypto-js";
import gogs from '../components/core/login/GogsApi.js';
import sync from '../components/core/SideBar/GitSync.js';
import { remote } from 'electron';
let dialog = remote.dialog;
import path from 'path-extra';
let defaultSave = path.join(path.homedir(), 'translationCore');
import { shell } from 'electron';
import fs from 'fs-extra';
import KonamiContainer from "../containers/KonamiContainer.js";
import StatusBarContainer from '../containers/StatusBarContainer';
import SideBarContainer from '../containers/SideBarContainer';
import ImportUsfm from '../components/core/Usfm/ImportUSFM.js';
import SwitchCheck from '../components/core/SwitchCheck';
import LoaderContainer from '../containers/LoaderContainer';
import RootStyles from './RootStyle';
import Grid from 'react-bootstrap/lib/Grid.js';
import Button from 'react-bootstrap/lib/Button.js';
import Row from 'react-bootstrap/lib/Row.js';
import Col from 'react-bootstrap/lib/Col.js';
import ModuleProgress from '../components/core/ModuleProgress/ModuleProgressBar'
import CheckDataGrabber from '../components/core/create_project/CheckDataGrabber.js';
import loadOnline from '../components/core/LoadOnline';
import RecentProjects from '../components/core/RecentProjects';
import Welcome from '../components/core/welcome/welcome';
import AlertModalContainer from '../containers/AlertModalContainer';
import Access from '../components/core/AccessProject.js';
let api = window.ModuleApi;
import ModuleWrapperContainer from '../containers/ModuleWrapperContainer';
import CoreStore from '../stores/CoreStore.js';
import PopoverContainer from '../containers/PopoverContainer';
import ModalContainer from '../containers/ModalContainer.js';
import ToolsActions from '../actions/ToolsActions.js';
import CheckStoreActions from '../actions/CheckStoreActions.js';
import LoaderActions from '../actions/LoaderActions.js';
import { setSettings } from '../actions/SettingsActions.js'
import DragDropActions from '../actions/DragDropActions.js';
import NotificationContainer from '../containers/NotificationContainer';
import { showNotification } from '../actions/NotificationActions.js';

var Main = React.createClass({
  componentWillMount() {
    //initializing app settings
    const tCDir = path.join(pathex.homedir(), 'translationCore');
    fs.ensureDirSync(tCDir);
    this.props.dispatch(recentProjectActions.getProjectsFromFolder());
    //changing check, (group index, check index) ...one or the other or both
    var online = window.navigator.onLine;
    this.props.changeOnlineStatus(online, true);
  },

  getInitialState() {
    const user = CoreStore.getLoggedInUser();
    this.state =
      Object.assign({}, this.state, {
        subMenuOpen: true,
        mainViewVisible: this.props.coreStoreReducer.mainViewVisible,
        currentToolNamespace: null,
        currentGroupName: null
      });
    var tutorialState = api.getSettings('tutorialView');
    if (tutorialState === 'show' || tutorialState === null) {
      return {
        ...this.state,
        firstTime: true
      }
    } else {
      return {
        ...this.state,
        firstTime: false
      }
    }
  },

  componentDidMount: function () {
    var packageJson = require(window.__base + '/package.json');
    if (localStorage.getItem('version') !== packageJson.version) {
      localStorage.removeItem('lastProject');
      localStorage.removeItem('lastCheckModule');
      localStorage.setItem('version', packageJson.version);
    }
    if (localStorage.getItem('crashed') == 'true') {
      localStorage.removeItem('crashed');
      localStorage.removeItem('lastProject');
      this.props.dispatch(setSettings('showTutorial', false));
    }

    if (localStorage.getItem('user')) {
      var phrase = api.getAuthToken('phrase') != undefined ? api.getAuthToken('phrase') : "tc-core";
      var decrypted = CryptoJS.AES.decrypt(localStorage.getItem('user'), phrase);
      var userdata = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
      var _this = this;
      var Token = api.getAuthToken('gogs');
      gogs(Token).login(userdata).then((userdata) => {
        CoreActions.login(userdata);
        CoreActions.updateOnlineStatus(true);
        this.props.dispatch({
          type: "RECEIVE_LOGIN",
          val: userdata
        });
      }).catch(function (reason) {
        console.log(reason);
        if (reason.status === 401) {
          dialog.showErrorBox('Login Failed', 'Incorrect username or password');
        } else if (reason.hasOwnProperty('message')) {
          dialog.showErrorBox('Login Failed', reason.message);
        } else if (reason.hasOwnProperty('data')) {
          let errorMessage = reason.data;
          dialog.showErrorBox('Login Failed', errorMessage);
        } else {
          dialog.showErrorBox('Login Failed', 'Unknown Error');
        }
      });
    }
    var saveLocation = localStorage.getItem('lastProject');
    try {
      if (api.getSettings('tutorialView') !== 'show' && saveLocation) {
        var lastProjectFiles = fs.readdirSync(saveLocation);
        this.props.sendFilePath(saveLocation, null, (err) => {
          var lastCheckModule = localStorage.getItem('lastCheckModule');
          if (lastCheckModule) {
            this.props.startLoadingNewProject(lastCheckModule);
          }
        });
      }
    } catch (e) {
      var splitArr = e.path.split("/");
      api.createAlert(
        {
          title: 'Error Opening Last Project',
          content: `Last project ${splitArr[splitArr.length - 1]} was not found.`,
          moreInfo: e,
          leftButtonText: "Ok"
        },
        () => {
          localStorage.removeItem('lastProject');
        });
    }

  },

  componentDidUpdate: function (prevProps, prevState) {
    if (this.showCheck == true) {
      this.showCheck = false;
    }
  },

  finishWelcome: function () {
    this.setState({
      firstTime: false
    });
    this.showCheck = true;
  },

  render: function () {
    var _this = this;
    if (this.state.firstTime) {
      return (
        <Welcome initialize={this.finishWelcome} />
      )
    } else {
      return (
        <div className='fill-height'>
          <KonamiContainer />
          <ModalContainer />
          <PopoverContainer />
          <NotificationContainer />
          <Grid fluid style={{ padding: 0 }}>
            <Row style={{ margin: 0 }}>
              <StatusBarContainer />
            </Row>
            <Col className="col-fluid" xs={1} sm={2} md={2} lg={3} style={{ padding: 0, width: "250px" }}>
              <SideBarContainer />
            </Col>
            <Col style={RootStyles.ScrollableSection} xs={7} sm={8} md={9} lg={9.5}>
              <LoaderContainer />
              <AlertModalContainer />
              <ModuleWrapperContainer />
            </Col>
          </Grid>
        </div>
      )
    }
  }
});

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    dispatch: dispatch,
    getToolsMetadatas: () => {
      dispatch(ToolsActions.getToolsMetadatas());
    },
    showToolsInModal: (visible) => {
      if (visible) {
        dispatch(modalActions.showModalContainer(true));
        dispatch(modalActions.selectModalTab(3))
      } else {
        dispatch(modalActions.showModalContainer(false));
      }
    },
    showProjectsInModal: (visible) => {
      if (visible) {
        dispatch(modalActions.showModalContainer(true));
        dispatch(modalActions.selectModalTab(2))
      } else {
        dispatch(modalActions.showModalContainer(false));
      }
    },
    openModalAndSpecificTab: (visible, tabkey, sectionKey) => {
      dispatch(modalActions.showModalContainer(true));
      dispatch(modalActions.selectModalTab(tabkey, sectionKey));
    },
    updateModuleView: (type) => {
      dispatch(CoreActionsRedux.changeModuleView(type));
    },
    toggleLoaderModal: () => {
      dispatch(LoaderActions.toggleLoader());
    },
    changeOnlineStatus: (val, first) => {
      dispatch(CoreActionsRedux.changeOnlineStatus(val, first));
    },
    sendFilePath: (filePath, link, callback) => {
      dispatch(DragDropActions.sendFilePath(filePath, link, callback));
    },
    startLoadingNewProject: (lastCheckModule) => {
      dispatch(recentProjectActions.startLoadingNewProject(lastCheckModule));
    },
    showMainView: (val) => {
      dispatch(CoreActionsRedux.showMainView(val));
    },
    progressFunc: (key, name) => {
      dispatch(LoaderActions.sendProgressForKey(key, name, this.props.loaderReducer));
    }
  };
}

function mapStateToProps(state) {
  //This will come in handy when we separate corestore and checkstore in two different reducers
  //Object.assign({}, state, state.coreStoreReducer)
  return state;
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(Main);
