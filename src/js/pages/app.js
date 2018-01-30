import React, { Component } from 'react';
import { connect } from 'react-redux';
import fs from 'fs-extra';
import PropTypes from 'prop-types';
import path from 'path-extra';
import ospath from 'ospath';
import { Grid, Row } from 'react-bootstrap';
import injectTapEventPlugin from 'react-tap-event-plugin';
// injectTapEventPlugin Handles onTouchTap events from material-ui components
injectTapEventPlugin();
// container
import ScreenDimmerContainer from '../containers/ScreenDimmerContainer';
import KonamiContainer from '../containers/KonamiContainer';
import StatusBarContainer from '../containers/StatusBarContainer';
import BodyContainer from '../containers/home/BodyContainer';
import LoaderContainer from '../containers/LoaderContainer';
import PopoverContainer from '../containers/PopoverContainer';
import AlertDialogContainer from '../containers/AlertDialogContainer';
import ProjectValidationContainer from '../containers/projectValidation/ProjectValidationContainer';
// actions
import * as ResourcesActions from '../actions/ResourcesActions';
import * as OnlineModeActions from '../actions/OnlineModeActions';
import * as MigrationActions from '../actions/MigrationActions';
import { loadLocalization, APP_LOCALE_SETTING } from '../actions/LocaleActions';
import {getLocaleLoaded, getSetting} from '../reducers';

import packageJson from '../../../package.json';
import { withLocale } from '../components/Locale';

class Main extends Component {

  componentWillMount() {
    const tCDir = path.join(ospath.home(), 'translationCore', 'projects');
    fs.ensureDirSync(tCDir);

    // load app locale
    const {settingsReducer} = this.props;
    const localeDir = path.join(__dirname, '../../locale');
    const appLocale = settingsReducer.currentSettings.appLocale;
    this.props.actions.loadLocalization(localeDir, appLocale);
  }

  componentDidMount() {
    if (localStorage.getItem('version') !== packageJson.version) {
      localStorage.setItem('version', packageJson.version);
      // the users resources folder will be deleted for every new app version and then regenerated.
      this.props.actions.migrateResourcesFolder();
    }
    // migration logic for toolsSettings in settings.json
    this.props.actions.migrateToolsSettings();
    this.props.actions.getResourcesFromStaticPackage();
    this.props.actions.getAnchorTags();
  }

  render() {
    const {isLocaleLoaded} = this.props;
    if(isLocaleLoaded) {
      const LocalizedStatusBarContainer = withLocale(StatusBarContainer);
      const LocalizedLoader = withLocale(LoaderContainer);
      return (
        <div className="fill-height">
          <ScreenDimmerContainer/>
          <ProjectValidationContainer/>
          <AlertDialogContainer/>
          <KonamiContainer/>
          <PopoverContainer/>
          <LocalizedLoader/>
          <Grid fluid style={{padding: 0}}>
            <Row style={{margin: 0}}>
              <LocalizedStatusBarContainer/>
            </Row>
            <BodyContainer/>
          </Grid>
        </div>
      );
    } else {
      // wait for locale to finish loading.
      // this should be less than a second.
      return null;
    }
  }
}

Main.propTypes = {
  actions: PropTypes.any.isRequired,
  settingsReducer: PropTypes.object,
  isLocaleLoaded: PropTypes.bool
};

const mapStateToProps = state => {
  return {
    ...state,
    isLocaleLoaded: getLocaleLoaded(state),
    appLanguage: getSetting(state, APP_LOCALE_SETTING)
  };
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
        dispatch(MigrationActions.migrateToolsSettings());
      },
      migrateResourcesFolder: () => {
        dispatch(MigrationActions.migrateResourcesFolder());
      },
      loadLocalization: (localeDir, activeLanguageCode) => {
        dispatch(loadLocalization(localeDir, activeLanguageCode));
      }
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Main);
