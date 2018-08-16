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
import {getResourcesFromStaticPackage} from '../helpers/ResourcesHelpers';
import * as OnlineModeActions from '../actions/OnlineModeActions';
import * as MigrationActions from '../actions/MigrationActions';
import * as SettingsMigrationActions from '../actions/SettingsMigrationActions';
import { loadLocalization, APP_LOCALE_SETTING } from '../actions/LocaleActions';
import {getLocaleLoaded, getSetting} from '../selectors';

import packageJson from '../../../package.json';
import { withLocale } from '../containers/Locale';

class Main extends Component {

  componentWillMount() {
    const {
      appLanguage,
      loadLocalization
    } = this.props;
    const tCDir = path.join(ospath.home(), 'translationCore', 'projects');
    fs.ensureDirSync(tCDir);

    // load app locale
    const localeDir = path.join(__dirname, '../../locale');
    loadLocalization(localeDir, appLanguage);
  }

  componentDidMount() {
    const {
      migrateResourcesFolder,
      migrateToolsSettings,
      getAnchorTags
    } = this.props;

    if (localStorage.getItem('version') !== packageJson.version) {
      localStorage.setItem('version', packageJson.version);
      // the users resources folder will be deleted for every new app version and then regenerated.
      migrateResourcesFolder();
    }
    // migration logic for toolsSettings in settings.json
    migrateToolsSettings();
    getResourcesFromStaticPackage();
    getAnchorTags();
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
          <Grid fluid style={{padding: 0, display:'flex', flexDirection:'column', height:'100%'}}>
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
  loadLocalization: PropTypes.func.isRequired,
  migrateResourcesFolder: PropTypes.func.isRequired,
  migrateToolsSettings: PropTypes.func.isRequired,
  getAnchorTags: PropTypes.func.isRequired,
  isLocaleLoaded: PropTypes.bool,
  appLanguage: PropTypes.any
};

const mapStateToProps = state => {
  return {
    isLocaleLoaded: getLocaleLoaded(state),
    appLanguage: getSetting(state, APP_LOCALE_SETTING)
  };
};

const mapDispatchToProps = {
  getAnchorTags: OnlineModeActions.getAnchorTags,
  migrateToolsSettings: SettingsMigrationActions.migrateToolsSettings,
  migrateResourcesFolder: MigrationActions.migrateResourcesFolder,
  loadLocalization
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Main);
