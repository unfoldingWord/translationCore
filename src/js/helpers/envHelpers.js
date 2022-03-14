import env from 'tc-electron-env';
import dotenv from 'dotenv';
import _ from 'lodash';

let count = 0;

export function initEnv(msg) {
  console.log(`initEnv - initial is electron: ${env.isElectron()}`);
  const { app } = require('@electron/remote');
  const dotenvConfig = dotenv.config()?.parsed;

  if (!dotenvConfig) {
    if (app) {
      console.log(`initEnv - config variables missing, but running in client mode, configuring app`);
      env.setApp(app);
    } else {
      console.log(`initEnv - config variables missing, running in test mode`);
    }
  } else {
    console.log('initEnv - Initializing environment');
    const pe = process.env;
    const newEnv = _.cloneDeep({
      ...pe,
      ...dotenvConfig,
    });
    env.setEnv(newEnv);
    env.setApp(app);
    env.setElectron(true);
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
