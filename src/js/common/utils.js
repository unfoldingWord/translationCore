import { ipcRenderer } from 'electron';

let dotenv = null; // for caching values

export function delay(ms) {
  return new Promise((resolve) =>
    setTimeout(resolve, ms)
  );
}

/**
 * get .env contents
 * @return {*}
 */
export function getDotEnv() {
  if (!dotenv) {
    const env = ipcRenderer.sendSync('get-env');
    console.log('getDotEnv() - env: ' + JSON.stringify(env));
    dotenv = env;
  }
  return dotenv || {};
}

/**
 * get .env contents
 * @return {*}
 */
export function getBuild() {
  return getDotEnv().BUILD;
}
