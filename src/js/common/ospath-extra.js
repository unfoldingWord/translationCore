// this is a patched ospath to work on client side in windows.  The problem was that ospath
// made use of process.env values which are no longer defined on the client side (looks to be
// security related).  To get the environment variable on client side can now use remote.process.env.
// TODO: electronite - investigate better solution
var path = require('path');
var os = require('os');

var isRunningClientSide = !process.env.HOME && !!window; // if environment not defined and we have a window
console.log('ospath-extra: running Client Side: ' + isRunningClientSide);
var processEnv = isRunningClientSide ? window.require('electron').remote.process.env : process.env;

function data () {
  switch (this.__platform || process.platform) {
    case 'win32': return path.resolve(processEnv.APPDATA);
    case 'darwin': return path.resolve(path.join(home.call(this), 'Library/Application Support/'));
    default: return processEnv.XDG_CONFIG_HOME
      ? path.resolve(processEnv.XDG_CONFIG_HOME)
      : path.resolve(path.join(home.call(this), '.config/'));
  }
}

function desktop () {
  return path.join(home.call(this), 'Desktop');
}

function home () {
  // io.js >= 2.3
  if ('homedir' in os) return os.homedir();

  switch (this.__platform || process.platform) {
    case 'win32': return path.resolve(processEnv.USERPROFILE);
    default: return path.resolve(processEnv.HOME)
  }
}

function tmp () {
  switch (this.__platform || process.platform) {
    case 'win32': return path.resolve(processEnv.TEMP);
    default: return path.resolve('/tmp');
  }
}

var ospath = {
  __platform: process.platform,
  data: data,
  desktop: desktop,
  home: home,
  tmp: tmp
};

module.exports = ospath;
