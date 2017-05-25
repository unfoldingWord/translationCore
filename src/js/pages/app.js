import React, { Component } from 'react';
import { connect } from 'react-redux';
import fs from 'fs-extra';
import path from 'path-extra';
import { Grid, Row, Col } from 'react-bootstrap';
import injectTapEventPlugin from 'react-tap-event-plugin';
// injectTapEventPlugin Handles onTouchTap events from material-ui components
injectTapEventPlugin();
// container
import NotificationContainer from '../containers/NotificationContainer';
import KonamiContainer from "../containers/KonamiContainer";
import StatusBarContainer from '../containers/StatusBarContainer';
import BodyContainer from '../containers/home/BodyContainer';
import LoaderContainer from '../containers/LoaderContainer';
import AlertModalContainer from '../containers/AlertModalContainer';
import PopoverContainer from '../containers/PopoverContainer';
import ModalContainer from '../containers/ModalContainer';
import AlertDialogContainer from '../containers/AlertDialogContainer';
// actions
import CoreActions from '../actions/CoreActions.js';
import * as recentProjectActions from '../actions/RecentProjectsActions';
import * as DragDropActions from '../actions/DragDropActions';
// constant declarations
const api = window.ModuleApi;

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
        <AlertDialogContainer />
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
