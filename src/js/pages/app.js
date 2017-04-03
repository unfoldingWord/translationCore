import React from 'react';
import ReactDOM from 'react-dom';
import CoreActions from '../actions/CoreActions.js';
import * as recentProjectActions from '../actions/RecentProjectsActions.js';
import * as CoreActionsRedux from '../actions/CoreActionsRedux.js';
import { setSettings } from '../actions/SettingsActions.js'
import * as DragDropActions from '../actions/DragDropActions.js';
import NotificationContainer from '../containers/NotificationContainer';
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
import LoaderContainer from '../containers/LoaderContainer';
import RootStyles from './RootStyle';
import Grid from 'react-bootstrap/lib/Grid.js';
import Button from 'react-bootstrap/lib/Button.js';
import Row from 'react-bootstrap/lib/Row.js';
import Col from 'react-bootstrap/lib/Col.js';
import loadOnline from '../components/core/LoadOnline';
import RecentProjects from '../components/core/RecentProjects';
import Welcome from '../components/core/welcome/welcome';
import AlertModalContainer from '../containers/AlertModalContainer';
let api = window.ModuleApi;
import ModuleWrapperContainer from '../containers/ModuleWrapperContainer';
import PopoverContainer from '../containers/PopoverContainer';
import ModalContainer from '../containers/ModalContainer.js';

var Main = React.createClass({
  componentWillMount() {
    //initializing app settings
    const tCDir = path.join(pathex.homedir(), 'translationCore');
    fs.ensureDirSync(tCDir);
    //changing check, (group index, check index) ...one or the other or both
    var online = window.navigator.onLine;
    this.props.changeOnlineStatus(online, true);
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
    var projectSaveLocation = localStorage.getItem('lastProject');
    try {
      if (api.getSettings('tutorialView') !== 'show' && projectSaveLocation) {
        var lastProjectFiles = fs.readdirSync(projectSaveLocation);
        this.props.sendFilePath(projectSaveLocation);
        var lastCheckModule = localStorage.getItem('lastCheckModule');
        if (lastCheckModule) {
          this.props.startLoadingNewProject(lastCheckModule);
        }
      }
    } catch (e) {
      if (e.path) {
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
    }

  },

  render: function () {
    // logging the store for testing.
    console.log('~ app.js ~',this.props)
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
});

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    dispatch: dispatch,
    changeOnlineStatus: (val, first) => {
      dispatch(CoreActionsRedux.changeOnlineStatus(val, first));
    },
    sendFilePath: (filePath, link, callback) => {
      dispatch(DragDropActions.sendFilePath(filePath, link, callback));
    },
    startLoadingNewProject: (lastCheckModule) => {
      dispatch(recentProjectActions.startLoadingNewProject(lastCheckModule));
    }
  };
}

function mapStateToProps(state) {
  return state;
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(Main);
