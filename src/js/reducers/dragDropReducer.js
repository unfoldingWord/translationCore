var consts = require('../actions/CoreActionConsts');
const gogs = require('../components/core/login/GogsApi.js');
const merge = require('lodash.merge');

const initialState = {
    filePath: '',
    properties: ['openDirectory', 'openFile'],
    dialogOpen: false,
    validFile: false
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
        case consts.VALID_OPENED_PROJECT:
            return merge({}, state, {
                validFile: true
            })
            break;
        case consts.LOAD_TOOL:
            return merge({}, state, {
                validFile: false
            })
            break;
        default:
            return state;
    }
}
