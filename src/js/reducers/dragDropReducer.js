var consts = require('../actions/CoreActionConsts');
const gogs = require('../components/core/login/GogsApi.js');
const merge = require('lodash.merge');

const initialState = {
    filePath: '',
    properties: ['openDirectory', 'openFile'],
    dialogOpen: false
};

module.exports = (state = initialState, action) => {
    switch (action.type) {
        case consts.DRAG_DROP_SENDPATH:
            return merge({}, state, {
                filePath: action.filePath
            })
            break;
        case consts.DRAG_DROP_OPENDIALOG:
            return merge({}, state, {
                dialogOpen: action.dialogOpen
            })
            break;
        default:
            return state;
    }
}
