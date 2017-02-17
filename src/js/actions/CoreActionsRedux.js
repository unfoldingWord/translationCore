var consts = require('./CoreActionConsts');
var Path = require('path');
var fs = require(window.__base + 'node_modules/fs-extra');
const exec = require('child_process').exec;
var sudo = require('sudo-prompt');
var options = {
  name: 'Translation Core'
};

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

module.exports.changeOnlineStatus = function (online, firstLoad) {
  return ((dispatch) => {
    if (process.platform == 'win32') {
      var TCportAllowed = true;
      if (firstLoad) {
        sudo.exec(`netsh advfirewall firewall show rule name="block tc out"`, options, function (error, stdout, stderror) {
          if (!error) {
            stdout = stdout.replace(/ /g, '');
            TCportAllowed = !stdout.includes("Enabled:Yes");
          }
          dispatch({
            type: "CHANGE_ONLINE_STATUS",
            online: TCportAllowed
          });
          return;
        })
      } else {
        if (online) {
          sudo.exec(`netsh advfirewall firewall delete rule name="block tc in" && netsh advfirewall firewall delete rule name="block tc out"`, options, function (error, stdout, stderror) {
            dispatch({
              type: "CHANGE_ONLINE_STATUS",
              online: online
            })
          })
        }
        else {
          exec(`wmic process where processId=${process.pid} get ExecutablePath`, options, function (error, execPath, stderror) {
            sudo.exec(`netsh advfirewall firewall add rule name="block tc in" dir=in program="${execPath}" action=block && netsh advfirewall firewall add rule name="block tc out" dir=out program=${execPath} action=block`, options, () => {
              dispatch({
                type: "CHANGE_ONLINE_STATUS",
                online: online
              });
            });
          });
        }
      }
    } else {
      if (online == window.navigator.onLine && firstLoad) {
        dispatch({
          type: "CHANGE_ONLINE_STATUS",
          online: online
        });
        return;
      }
      if (online) {
        exec('networksetup -setairportpower en1 on').then(function (cp) {
          dispatch({
            type: "CHANGE_ONLINE_STATUS",
            online: online
          })
        });
      } else {
        exec('networksetup -setairportpower en1 off').then(function (cp) {
          dispatch({
            type: "CHANGE_ONLINE_STATUS",
            online: online
          })
        });
      }
    }
  })
}
