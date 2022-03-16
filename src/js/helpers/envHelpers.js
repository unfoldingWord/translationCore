import env from 'tc-electron-env';
import _ from 'lodash';
import path from 'path-extra';

let count = 0;

/**
 * save discovered configuration
 * @param dotenvConfig
 * @param app
 */
function setDotEnv(dotenvConfig, app) {
  const pe = process.env;
  const newEnv = _.cloneDeep({
    ...pe,
    ...dotenvConfig,
  });
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
  const { app } = require('@electron/remote');
  const dotenv = require('dotenv');
  let failed = true;

  // const fs = require('fs-extra');
  // console.log('folder', __dirname);
  //
  // const folders = [__dirname, path.join(__dirname, 'static'), path.join(__dirname, '..')];
  //
  // for (const folder of folders) {
  //   try {
  //     const files = fs.readdirSync(folder);
  //     console.log(`files ${folder}`, files);
  //     // eslint-disable-next-line no-empty
  //   } catch (e) {
  //     console.warn(`could not read files from ${folder}`, e);
  //   }
  // }

  const configPath = path.join(__dirname, 'cfg.txt');
  const envConfig = dotenv.config({ path: configPath });
  const dotenvConfig = envConfig?.parsed;

  if (!dotenvConfig) {
    if (app) {
      console.log(`initEnv - config variables missing, but running in client mode, configuring app`);
      env.setApp(app);
    } else {
      console.log(`initEnv - config variables missing, running in test mode`);
    }
  } else {
    console.log(`initEnv - Initializing environment`);
    setDotEnv(dotenvConfig, app);
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
