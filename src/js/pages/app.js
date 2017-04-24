import React, { Component } from 'react';
import { connect } from 'react-redux';
import fs from 'fs-extra';
import path from 'path-extra';
import { remote } from 'electron';
import CryptoJS from "crypto-js";
import gogs from '../components/core/login/GogsApi.js';
import {Grid, Row, Col } from 'react-bootstrap';

import injectTapEventPlugin from 'react-tap-event-plugin';
// injectTapEventPlugin Handles onTouchTap events from material-ui components
injectTapEventPlugin();
// container
import NotificationContainer from '../containers/NotificationContainer';
import KonamiContainer from "../containers/KonamiContainer.js";
import StatusBarContainer from '../containers/StatusBarContainer';
import BodyContainer from '../containers/BodyContainer';

import LoaderContainer from '../containers/LoaderContainer';
import AlertModalContainer from '../containers/AlertModalContainer';

import PopoverContainer from '../containers/PopoverContainer';
import ModalContainer from '../containers/ModalContainer.js';
// actions
import CoreActions from '../actions/CoreActions.js';
import * as recentProjectActions from '../actions/RecentProjectsActions.js';
import * as DragDropActions from '../actions/DragDropActions.js';
// constant declarations
const api = window.ModuleApi;
const {dialog} = remote;


class Main extends Component {

  componentWillMount() {
    const tCDir = path.join(path.homedir(), 'translationCore');
    fs.ensureDirSync(tCDir);
  }

  componentDidMount() {
    var packageJson = require(window.__base + '/package.json');
    if (localStorage.getItem('version') !== packageJson.version) {
      localStorage.removeItem('lastProject');
      localStorage.removeItem('lastCheckModule');
      localStorage.setItem('version', packageJson.version);
    }
    if (localStorage.getItem('crashed') == 'true') {
      localStorage.removeItem('crashed');
      localStorage.removeItem('lastProject');
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
  }

  render() {
    return (
      <div className="fill-height">
        <KonamiContainer />
        <ModalContainer />
        <PopoverContainer />
        <NotificationContainer />
        <LoaderContainer />
        <AlertModalContainer />
        <Grid fluid style={{ padding: 0 }}>
          <Row style={{ margin: 0 }}>
            <StatusBarContainer />
          </Row>
          <BodyContainer />
        </Grid>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    dispatch: dispatch,
    sendFilePath: (filePath, link, callback) => {
      dispatch(DragDropActions.sendFilePath(filePath, link, callback));
    },
    startLoadingNewProject: lastCheckModule => {
      dispatch(recentProjectActions.startLoadingNewProject(lastCheckModule));
    }
  };
};

const mapStateToProps = state => {
  return state;
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Main);
