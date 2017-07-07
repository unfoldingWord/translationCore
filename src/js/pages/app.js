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

class Main extends Component {

  componentWillMount() {
    const tCDir = path.join(path.homedir(), 'translationCore');
    fs.ensureDirSync(tCDir);
  }

  componentDidMount() {
    var packageJson = require(window.__base + '/package.json');
    if (localStorage.getItem('version') !== packageJson.version) {
      localStorage.setItem('version', packageJson.version);
    }
    this.props.actions.getResourcesFromStaticPackage();
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

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    actions: {
      getResourcesFromStaticPackage: () => {
        ResourcesActions.getResourcesFromStaticPackage();
      }
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Main);
