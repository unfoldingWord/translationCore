import React, { Component } from 'react';
import { connect } from 'react-redux';
import fs from 'fs-extra';
import PropTypes from 'prop-types';
import path from 'path-extra';
import { Grid, Row } from 'react-bootstrap';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { withLocalize } from 'react-localize-redux';
import env, { getBuild } from 'tc-electron-env';
// container
import AlertContainer from '../containers/AlertContainer';
import ScreenDimmerContainer from '../containers/ScreenDimmerContainer';
import KonamiContainer from '../containers/KonamiContainer';
import StatusBarContainer from '../containers/StatusBarContainer';
import BodyContainer from '../containers/home/BodyContainer';
import PopoverContainer from '../containers/PopoverContainer';
import AlertDialogContainer from '../containers/AlertDialogContainer';
import ProjectValidationContainer from '../containers/projectValidation/ProjectValidationContainer';
// actions
import * as OnlineModeActions from '../actions/OnlineModeActions';
import * as MigrationActions from '../actions/MigrationActions';
import * as SettingsMigrationActions from '../actions/SettingsMigrationActions';
import { loadLocalization, APP_LOCALE_SETTING } from '../actions/LocaleActions';
import { getLocaleLoaded, getSetting } from '../selectors';
import { loadTools } from '../actions/ToolActions';
import { withLocale } from '../helpers/localeHelpers';
import { injectFileLogging } from '../helpers/logger';
// helpers
import { getOsInfoStr } from '../helpers/FeedbackHelpers';
// constants
import {
  APP_VERSION,
  LOG_FILES_PATH,
  LOCALE_DIR,
  TOOLS_DIR,
} from '../common/constants';
import ConfirmationDialog from '../middleware/confirmation/ConfirmationDialog';

if (process.env.NODE_ENV !== 'test') {
  console.log('folder', __dirname);

  const folders = ['.', __dirname, path.join(__dirname, 'static'), path.join(__dirname, 'static/js')];

  for (const folder of folders) {
    try {
      const files = fs.readdirSync(folder);
      console.log(`files ${folder}`, files);
      // eslint-disable-next-line no-empty
    } catch (e) {
      console.warn(`could not read files from ${folder}`, e);
    }
  }

  const { makeSureEnvInit } = require('../helpers/envHelpers');
  makeSureEnvInit('app');
}

if (process.env.NODE_ENV === 'production') {
  const version = `v${APP_VERSION} (${getBuild()})`;
  injectFileLogging(LOG_FILES_PATH, version);
  console.log('SYSTEM INFO:\n' + getOsInfoStr());
}

class Main extends Component {
  componentDidMount() {
    const {
      loadTools,
      initialize,
      appLanguage,
      getAnchorTags,
      loadLocalization,
      setActiveLanguage,
      migrateToolsSettings,
      migrateResourcesFolder,
      addTranslationForLanguage,
    } = this.props;

    if (process.env.NODE_ENV !== 'test') {
      const { makeSureEnvInit } = require('../helpers/envHelpers');
      makeSureEnvInit('Main');
    }

    const tCDir = path.join(env.home(), 'translationCore', 'projects');
    fs.ensureDirSync(tCDir);

    loadLocalization(LOCALE_DIR, appLanguage, initialize, addTranslationForLanguage, setActiveLanguage);

    loadTools(TOOLS_DIR);

    if (localStorage.getItem('version') !== APP_VERSION) {
      localStorage.setItem('version', APP_VERSION);
    }

    migrateResourcesFolder();
    // migration logic for toolsSettings in settings.json
    migrateToolsSettings();
    getAnchorTags();
  }

  render() {
    const { isLocaleLoaded } = this.props;

    if (isLocaleLoaded) {
      const LocalizedStatusBarContainer = withLocale(StatusBarContainer);
      return (
        <MuiThemeProvider>
          <div className="fill-height">
            <ScreenDimmerContainer />
            <ProjectValidationContainer />
            <AlertContainer />
            <AlertDialogContainer />
            <KonamiContainer />
            <PopoverContainer />
            <Grid fluid style={{
              padding: 0, display: 'flex', flexDirection: 'column', height: '100vh',
            }}>
              <Row style={{ margin: 0 }}>
                <LocalizedStatusBarContainer/>
              </Row>
              <BodyContainer />
            </Grid>
            <ConfirmationDialog stateKey="confirm"/>
          </div>
        </MuiThemeProvider>
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
  addTranslationForLanguage: PropTypes.func.isRequired,
  setActiveLanguage: PropTypes.func.isRequired,
  migrateResourcesFolder: PropTypes.func.isRequired,
  migrateToolsSettings: PropTypes.func.isRequired,
  getAnchorTags: PropTypes.func.isRequired,
  isLocaleLoaded: PropTypes.bool,
  appLanguage: PropTypes.any,
  loadTools: PropTypes.func.isRequired,
  initialize: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  isLocaleLoaded: getLocaleLoaded(state),
  appLanguage: getSetting(state, APP_LOCALE_SETTING),
});

const mapDispatchToProps = {
  getAnchorTags: OnlineModeActions.getAnchorTags,
  migrateToolsSettings: SettingsMigrationActions.migrateToolsSettings,
  migrateResourcesFolder: MigrationActions.migrateResourcesFolder,
  loadLocalization,
  loadTools,
};

export default withLocalize(connect(
  mapStateToProps,
  mapDispatchToProps,
)(Main));
