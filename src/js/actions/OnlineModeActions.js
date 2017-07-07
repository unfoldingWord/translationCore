import React from 'react';
import consts from './ActionTypes';
import * as AlertModalActions from './AlertModalActions';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { Checkbox } from 'material-ui';

export function confirmOnlineAction(callback) {
  return ((dispatch, getState) => {
    var onlineMode = getState().settingsReducer.onlineMode;
    if (!onlineMode) {
      dispatch(AlertModalActions.openOptionDialog(onlineModeWarning((val)=>dispatch(checkBox(val))),
        (result) => {
          if (result != 'Cancel') {
            callback();
          } else dispatch(AlertModalActions.closeAlertDialog())
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
        <div style={{display:'flex'}}>{agreeCheckBox(checkBoxAction)} Do not show this warning again</div>
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