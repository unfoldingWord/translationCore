var consts = require('./CoreActionConsts');
var Path = require('path');
var fs = require(window.__base + 'node_modules/fs-extra');
const exec = require('child_process').exec;
var Sudoer = require('electron-sudo').default;
let options = { name: 'electron sudo application' };
var sudoer = new Sudoer(options);

/**
How to use the actions:
Just require this file in your component, call
one of the functions and the event will automatically
be dispatched to all of the stores that have registered
listener
(See ExampleComponent.js)
*/

module.exports.showMainView = function (val) {
  return {
    type: consts.SHOW_APPS,
    val: val
  }
}

module.exports.changeModuleView = function (val) {
  return {
    type: consts.CHANGE_WRAPPER_VIEW,
    val: val
  }
}

module.exports.changeOnlineStyle = function (online) {
  return {
    type: "CHANGE_ONLINE_STATUS",
    online: online
  }
}

module.exports.changeOnlineStatus = function (online, reload) {
  if (online == window.navigator.onLine) {
    return {
      type: "CHANGE_ONLINE_STATUS",
      online: online
    }
  }
  if (process.platform == 'win32') {
    if (online) require('windosu').exec("netsh advfirewall firewall delete rule name='block tc in' && netsh advfirewall firewall delete rule name='block tc out'");
    else require('windosu').exec('netsh advfirewall firewall add rule name="block tc in" dir=in program="~\translationCore\node_modules\electron\dist\electron.exe" action=block && netsh advfirewall firewall add rule name="block tc out" dir=out')
    return {
      type: "CHANGE_ONLINE_STATUS",
      online: online
    }
  } else {
    if (online) {
      sudoer.exec('networksetup -setairportpower en1 on').then(function (cp) {
        console.log(cp)
      });
    } else {
      sudoer.exec('networksetup -setairportpower en1 off').then(function (cp) {
        console.log(cp)
      });
    }
  }
  return {
    type: "CHANGE_ONLINE_STATUS",
    online: online
  }
}
