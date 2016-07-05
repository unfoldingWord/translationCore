module.exports = {
  "AddCheck": "ADD_CHECK",
  "NextVerse": "NEW_VERSE",
  "PrevVerse": "NEW_VERSE",
  "UpdateOl": "UPDATE_ORIGINAL_LANGUAGE",
  "UpdateTl": "UPDATE_TARGET_LANGUAGE",
  "UpdateGl": "UPDATE_GATEWAY_LANGUAGE",
  "UpdateModal": "CHANGE_UPLOAD_MODAL_VISIBILITY"
};

/**
Object that maps words to consts for use in actions
For example, in a register callback in a Store, it is recommended
that when you check the action type, you do it in the following manner:

var consts = require("CoreActionConsts.js");
...
if (action == consts["AddCheck"])

rather than

if (action == "ADD_CHECK")

This keeps it modular and stuff probably

Just add in more actions as they are needed
*/
