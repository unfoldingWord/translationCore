const merge = require('lodash.merge');
const consts = require('../actions/CoreActionConsts');

const initialState = {
  notificationObject: {
    visibleNotification: false,
    message: "",
    duration: 0,
  }
};

module.exports = (state = initialState, action) => {
  switch (action.type) {
    case consts.SHOW_NOTIFICATION:
      //converting duration from sec to milliseconds
      let duration = action.duration * 1000;
      return merge({}, state, {
        notificationObject: {
          visibleNotification: true,
          message: action.message,
          duration: duration,
        }
      });
    case consts.HIDE_NOTIFICATION:
      return merge({}, state, {
        notificationObject: {
          visibleNotification: false,
          message: ""
        }
      });
    default:
      return state;
  }
}
