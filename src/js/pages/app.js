import React, { Component } from 'react';
import { connect } from 'react-redux';
import fs from 'fs-extra';
import PropTypes from 'prop-types';
import path from 'path-extra';
import { Grid, Row } from 'react-bootstrap';
import { ipcRenderer } from 'electronite';
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
  TC_PATH,
  TOOLS_DIR,
} from '../common/constants';
import ConfirmationDialog from '../middleware/confirmation/ConfirmationDialog';

const NOT_TEST = process.env.NODE_ENV !== 'test';

if (NOT_TEST) {
  const version = `v${APP_VERSION} (${getBuild()})`;
  injectFileLogging(LOG_FILES_PATH, version);
  console.log('SYSTEM INFO:\n' + getOsInfoStr());
}

// fallback AI bridge in case the preload didn't set it up - keep in step with electronite/preloadAiApi.js
if (window && (!window.lmStudio || !window.AiAPIs)) {
  const AI_API_FEATURES = Object.freeze({
    messages: true, localServer: true, modelUpdates: true,
  });

  const localServer = Object.freeze({ // bundled llama-server
    start: (options = {}) => ipcRenderer.invoke('ai-apis:local-server-start', options),
    stop: () => ipcRenderer.invoke('ai-apis:local-server-stop'),
    getStatus: () => ipcRenderer.invoke('ai-apis:local-server-status'),
    getModels: () => ipcRenderer.invoke('ai-apis:local-server-models'),
  });

  const models = Object.freeze({ // model updates from the GitHub release
    checkForUpdates: () => ipcRenderer.invoke('ai-apis:models-check-updates'),
    download: async (updates, onProgress) => {
      const listener = (event, progress) => onProgress && onProgress(progress);
      ipcRenderer.on('ai-apis:models-download-progress', listener);

      try {
        return await ipcRenderer.invoke('ai-apis:models-download', updates);
      } finally {
        ipcRenderer.removeListener('ai-apis:models-download-progress', listener);
      }
    },
    cancelDownload: () => ipcRenderer.invoke('ai-apis:models-cancel-download'),
  });

  const makeAiApi = () => ({
    getApi: (options = {}) => ipcRenderer.invoke('ai-apis:get-api', options),
    getAvailableModels: (options = {}) => ipcRenderer.invoke('ai-apis:get-available-models', options),
    query: (query, options = {}) => ipcRenderer.invoke('ai-apis:query', query, options),
    localServer,
    models,
    features: AI_API_FEATURES,
  });

  if (!window.lmStudio) {
    console.log('creating window.lmStudio since it does not exist on window');
    window.lmStudio = makeAiApi(); // older API, should use AiAPIs in future
  }

  if (!window.AiAPIs) {
    console.log('creating window.AiAPIs since it does not exist on window');
    window.AiAPIs = makeAiApi();
  }
}

const isAiApiQueryAvailable =
  typeof window !== 'undefined' &&
  typeof window.AiAPIs?.query === 'function';

console.log('isAiApiQueryAvailable', isAiApiQueryAvailable);

if (isAiApiQueryAvailable) {
  (async () => {
    const ai = window.AiAPIs;
    console.log('Checking for local AI server\nfeatures', ai.features);

    console.log('status', await ai.localServer.getStatus()); //  expect available: true
    console.log('models', await ai.getAvailableModels({ localServer: true }));
  })().catch(e => console.error('AI test failed:', e));
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

    if (NOT_TEST) {
      const { makeSureEnvInit } = require('../helpers/envHelpers');
      makeSureEnvInit('Main');
    }

    const tCDir = path.join(env.home(), TC_PATH, 'projects');
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
