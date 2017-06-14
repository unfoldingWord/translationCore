import consts from './ActionTypes';
import sudo from 'sudo-prompt';
// constant declarations
const exec = require('child_process').exec;
const options = {
  name: 'Translation Core'
};

export function changeOnlineStatus(online, firstLoad, fromButton) {
  return ((dispatch) => {
    if (!document.hasFocus() && !fromButton) return;
    //If the document is out of focus and the action is not created by the user
    if (process.platform == 'win32') {
      var TCportAllowed = true;
      if (firstLoad) {
        exec(`netsh advfirewall firewall show rule name="block tc out"`, options, function (error, stdout, stderror) {
          if (!error) {
            stdout = stdout.replace(/ /g, '');
            TCportAllowed = !stdout.includes("Enabled:Yes");
          }
          dispatch({
            type: consts.CHANGE_ONLINE_STATUS,
            online: TCportAllowed
          });
          return;
        })
      } else {
        if (online) {
          sudo.exec(`netsh advfirewall firewall delete rule name="block tc in" && netsh advfirewall firewall delete rule name="block tc out"`, options, function (error, stdout, stderror) {
            dispatch({
              type: consts.CHANGE_ONLINE_STATUS,
              online: online
            })
          })
        }
        else {
          exec(`wmic process where processId=${process.pid} get ExecutablePath`, options, function (error, execPath, stderror) {
            execPath = execPath.replace(/\r?\n|\r|\s|ExecutablePath/g, '');
            sudo.exec(`netsh advfirewall firewall add rule name="block tc in" dir=in program="${execPath}" action=block && netsh advfirewall firewall add rule name="block tc out" dir=out program="${execPath}" action=block`, options, () => {
              dispatch({
                type: consts.CHANGE_ONLINE_STATUS,
                online: online
              });
            });
          });
        }
      }
    } else {
      if (online == window.navigator.onLine && firstLoad) {
        dispatch({
          type: consts.CHANGE_ONLINE_STATUS,
          online: online
        });
        return;
      }
      if (online) {
        exec('networksetup -setairportpower en1 on', function (cp) {
          dispatch({
            type: consts.CHANGE_ONLINE_STATUS,
            online: online
          })
        });
      } else {
        exec('networksetup -setairportpower en1 off', function (cp) {
          dispatch({
            type: consts.CHANGE_ONLINE_STATUS,
            online: online
          })
        });
      }
    }
  })
}
