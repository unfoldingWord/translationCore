// this is a patched ospath to work on client side in windows.  The problem was that ospath
// made use of process.env values which are no longer defined on the client side (looks to be
// security related).  To get the environment variable can now use remote.process.env.
// TODO: electronite - investigate better solution
var path = require('path');
var os = require('os');
const { remote } = window.require('electron');

console.log('process.platform: ' + JSON.stringify(process.platform));

function data () {
  switch (this.__platform || process.platform) {
    case 'win32': return path.resolve(remote.process.env.APPDATA); // replaced process.env.APPDATA
    case 'darwin': return path.resolve(path.join(home.call(this), 'Library/Application Support/'));
    default: return process.env.XDG_CONFIG_HOME
      ? path.resolve(process.env.XDG_CONFIG_HOME)
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
    case 'win32': return path.resolve(remote.process.env.USERPROFILE); // replaced process.env.USERPROFILE
    default: return path.resolve(process.env.HOME)
  }
}

function tmp () {
  switch (this.__platform || process.platform) {
    case 'win32': return path.resolve(remote.process.env.TEMP); // replaced remote.process.env.TEMP
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
