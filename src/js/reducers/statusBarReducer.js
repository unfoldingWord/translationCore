const consts = require('../actions/CoreActionConsts');

const initialState = {
    path: "",
    newToolSelected: false,
    pressed: false,
    online: true
};

module.exports = (state = initialState, action) => {
    switch (action.type) {
        case consts.CHANGE_ONLINE_STATUS:
          return { ...state, online: action.online }
        default:
            return state;
    }
}
