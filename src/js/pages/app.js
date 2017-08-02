import React, { Component } from 'react';
import { connect } from 'react-redux';
import fs from 'fs-extra';
import path from 'path-extra';
import { Grid, Row } from 'react-bootstrap';
import injectTapEventPlugin from 'react-tap-event-plugin';
// injectTapEventPlugin Handles onTouchTap events from material-ui components
injectTapEventPlugin();
// container
import KonamiContainer from "../containers/KonamiContainer";
import StatusBarContainer from '../containers/StatusBarContainer';
import BodyContainer from '../containers/home/BodyContainer';
import LoaderContainer from '../containers/LoaderContainer';
import PopoverContainer from '../containers/PopoverContainer';
import ModalContainer from '../containers/mainModal/ModalContainer';
import AlertDialogContainer from '../containers/AlertDialogContainer';
// actions
import * as ResourcesActions from '../actions/ResourcesActions';
import * as OnlineModeActions from '../actions/OnlineModeActions';
import * as SettingsActions from '../actions/SettingsActions';

import packageJson from '../../../package.json';

class Main extends Component {

  componentWillMount() {
    const tCDir = path.join(path.homedir(), 'translationCore', 'projects');
    fs.ensureDirSync(tCDir);
  }

  componentDidMount() {
    if (localStorage.getItem('version') !== packageJson.version) {
      localStorage.setItem('version', packageJson.version);
    }
    // migration logic for toolsSettings in settings.json
    this.props.actions.migrateToolsSettings();
    this.props.actions.getResourcesFromStaticPackage();
    this.props.actions.getAnchorTags();
  }

  render() {

    return (
      <div className="fill-height">
        <AlertDialogContainer />
        <KonamiContainer />
        <ModalContainer />
        <PopoverContainer />
        <LoaderContainer />
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

const mapStateToProps = state => {
  return state;
};

const mapDispatchToProps = (dispatch) => {
  return {
    actions: {
      getResourcesFromStaticPackage: () => {
        ResourcesActions.getResourcesFromStaticPackage();
      },
      getAnchorTags: () => {
        dispatch(OnlineModeActions.getAnchorTags());
      },
      migrateToolsSettings: () => {
        dispatch(SettingsActions.migrateToolsSettings());
      }
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Main);
