module.exports = {
  ADD_CHECK: "ADD_CHECK",
  NEXT_VERSE: "NEXT_VERSE",
  PREV_VERSE: "PREV_VERSE",
  UPDATE_ORIGINAL_LANGUAGE: "UPDATE_ORIGINAL_LANGUAGE",
  UPDATE_TARGET_LANGUAGE: "UPDATE_TARGET_LANGUAGE",
  UPDATE_GATEWAY_LANGUAGE: "UPDATE_GATEWAY_LANGUAGE",
  CHANGE_UPLOAD_MODAL_VISIBILITY: "CHANGE_UPLOAD_MODAL_VISIBILITY",
  CHANGE_LOGIN_MODAL_VISIBILITY:"CHANGE_LOGIN_MODAL_VISIBILITY",
  ADD_TO_TEXT: "ADD_TO_TEXT",
  SETTINGS_VIEW: "SETTINGS_VIEW",
  ACCOUNT_LOGIN: "ACCOUNT_LOGIN",
  CHANGE_BUTTTON_STATUS: "CHANGE_BUTTTON_STATUS"

};

/**
Object that maps words to consts for use in actions
For example, in a register callback in a Store, it is recommended
that when you check the action type, you do it in the following manner:

var consts = require("CoreActionConsts.js");
...
if (action == consts.ADD_CHECK)

rather than

if (action == "ADD_CHECK")

This keeps it modular and stuff probably

Just add in more actions as they are needed
*/
