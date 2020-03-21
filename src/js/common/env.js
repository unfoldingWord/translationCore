// methods for accessing environment variables
// this is needed because many process.env values are no longer defined on the client side (looks to be
// security related).  To get the environment variable on client side can now use remote.process.env.

var isRunningClientSide = !process.env.HOME && !!window; // if environment not defined and we have a window
var processEnv = isRunningClientSide ? window.require('electron').remote.process.env : process.env;

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

var env = {
  getBuild,
  getEnv,
};

module.exports = env;
