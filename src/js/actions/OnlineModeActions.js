import React from 'react';
const { BrowserWindow } = require('electron').remote
import consts from './ActionTypes';
import * as AlertModalActions from './AlertModalActions';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { Checkbox } from 'material-ui';

export function confirmOnlineAction(callback) {
  return ((dispatch, getState) => {
    var onlineMode = getState().settingsReducer.onlineMode;
    if (!onlineMode) {
      dispatch(AlertModalActions.openOptionDialog(onlineModeWarning((val) => dispatch(checkBox(val))),
        (result) => {
          if (result != 'Cancel') {
            callback();
          }
          dispatch(AlertModalActions.closeAlertDialog())
        }, 'Access Internet', 'Cancel'))
    } else callback()
  })
}

export function agreeCheckBox(checkBoxAction) {
  return (
    <Checkbox
      style={{ width: "0px", marginRight: -10 }}
      iconStyle={{ fill: 'black' }}
      labelStyle={{ color: "var(--reverse-color)", opacity: "0.7", fontWeight: "500" }}
      onCheck={(e) => {
        checkBoxAction(e.target.checked)
      }}
    />
  )
}

export function onlineModeWarning(checkBoxAction) {
  return (
    <MuiThemeProvider>
      <div>
        <p style={{ fontSize: 15 }}>You are about to transmit data over the internet, you sure you want to do that?</p>
        <div style={{ display: 'flex' }}>{agreeCheckBox(checkBoxAction)} Do not show this warning again</div>
      </div>
    </MuiThemeProvider>
  )
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
export function getATags(dispatch) {
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
}