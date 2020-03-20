// methods for accessing environment variables
// this is needed because many process.env values are no longer defined on the client side (looks to be
// security related).  To get the environment variable on client side can now use remote.process.env.
const { app, remote } = require('electron');

const isRunningClientSide = remote && !!window; // if we are a render process and we have a window
const processEnv = isRunningClientSide ? remote.process.env : process.env;

// use app if we are main, otherwise we are render side so we use remote app
const appObject = !remote ? app : remote.app;

/**
 * get path to Home folder
 * @return {string}
 */
function home() {
  return appObject.getPath('home');
}

/**
 * get path to Home folder
 * @return {string}
 */
function data() {
  return appObject.getPath('appData');
}

/**
 * get Build number
 * @return {string}
 */
function getBuild() {
  return processEnv.BUILD;
}

/**
 * return appropriate process.env data
 * @return {*}
 */
function getEnv() {
  return processEnv;
}

const env = {
  data,
  getEnv,
  getBuild,
  home,
};

module.exports = env;
