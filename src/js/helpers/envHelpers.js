import env from 'tc-electron-env';
import _ from 'lodash';
import path from 'path-extra';

let count = 0;

/**
 * save discovered configuration
 * @param dotenvConfig
 * @param app
 * @param pe
 */
function setDotEnv(dotenvConfig, app, pe) {
  const env_ = {
    ...pe,
    ...dotenvConfig,
  };
  const newEnv = _.cloneDeep(env_);
  env.setEnv(newEnv);
  env.setApp(app);
  env.setElectron(true);
}

/**
 * make sure configuration is initialized
 * @param msg
 */
export function initEnv(msg) {
  console.log(`initEnv - initial is electron: ${env.isElectron()}`);
  const remote = require('@electron/remote');
  const { app } = remote;
  let failed = true;
  let dotenvConfig;
  const pe = remote.process.env;
  const build = pe.BUILD;

  console.log('folder', __dirname);

  if (build) {
    dotenvConfig = {}; // if environment is set, don't need additional env variables
  } else { // need to load env variables
    const dotenv = require('dotenv');
    const configPath = path.join(__dirname, 'cfg.txt');
    dotenvConfig = dotenv.config({ path: configPath })?.parsed;
  }

  if (!dotenvConfig) {
    if (app) {
      console.log(`initEnv - config variables missing, but running in client mode, configuring app`);
      env.setApp(app);
    } else {
      console.log(`initEnv - config variables missing, running in test mode`);
    }
  } else {
    console.log(`initEnv - Initializing environment`);
    setDotEnv(dotenvConfig, app, pe);
    failed = false;
  }

  if (!failed) {
    const home = env.home();

    if (!home) {
      console.error(`initEnv - cannot find home folder`);
    }

    const build = env.getEnv()?.BUILD;

    if (!build) {
      console.error(`initEnv - cannot find build number`);
    }

    console.log(`initEnv - final is electron: ${env.isElectron()}`);
  }
}

/**
 * Make sure environment is initialized if running as client.
 * work-around for electron 14+ to get access to runtime environment variables
 */
export function makeSureEnvInit(msg='') {
  console.log(`makeSureEnvInit() - Check pass ${++count}, in: ${msg}`);

  if (!env.isElectron()) { // if initialization failed
    initEnv(msg);
  }
}
