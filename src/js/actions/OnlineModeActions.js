const { BrowserWindow } = require('electron').remote
import consts from './ActionTypes';
import * as AlertModalActions from './AlertModalActions';``
import OnlineDialog from '../components/dialogComponents/OnlineDialog';

export function confirmOnlineAction(callback) {
  return ((dispatch, getState) => {
    var onlineMode = getState().settingsReducer.onlineMode;
    if (!onlineMode) {
      dispatch(AlertModalActions.openOptionDialog(OnlineDialog((val) => dispatch(checkBox(val))),
        (result) => {
          if (result != 'Cancel') {
            dispatch(AlertModalActions.closeAlertDialog())
            callback();
          } else dispatch(AlertModalActions.closeAlertDialog())
        }, 'Access Internet', 'Cancel'))
    } else callback()
  })
}

export function checkBox(val) {
  return {
    type: consts.UPDATE_ONLINE_MODE,
    val
  }
}

/**
 * @description - Intercepts on clicks and checks for http methods
 * @param {function} dispatch - The dispatcher
 */
export function getAnchorTags() {
  return ((dispatch) => {
    document.body.onclick = (e) => {
      e = e || event;
      var isLink = findParent('a', e.target || e.srcElement) && e.target.href && e.target.href.includes('http');
      if (isLink) {
        e.preventDefault();
        dispatch(confirmOnlineAction(() => {
          let win = new BrowserWindow({ width: 800, height: 600 })
          win.on('closed', () => {
            win = null
          })
          win.loadURL(e.target.href)
        }))
      }
    }
  
    /**
     * @description - Find a tag parents of an element
     * @param {string} tagname - name of the a tag clicked
     * @param {object} el - element of the a tag clicked
     */
    function findParent(tagname, el) {
      if ((el.nodeName || el.tagName).toLowerCase() === tagname.toLowerCase()) {
        return el;
      }
      while (el = el.parentNode) {
        if ((el.nodeName || el.tagName).toLowerCase() === tagname.toLowerCase()) {
          return el;
        }
      }
      return null;
    }
  });
}