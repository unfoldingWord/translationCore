const consts = require('../actions/CoreActionConsts');

const initialState = {
    filePath: '',
    properties: ['openDirectory', 'openFile'],
    dialogOpen: false,
    validFile: false
};

module.exports = (state = initialState, action) => {
    switch (action.type) {
        case consts.DRAG_DROP_SENDPATH:
          return { ...state, filePath: action.filePath }
        case consts.DRAG_DROP_OPENDIALOG:
          return { ...state, dialogOpen: action.dialogOpen }
        case consts.VALID_OPENED_PROJECT:
          return { ...state, validFile: true }
        case consts.LOAD_TOOL:
          return { ...state, validFile: false }
            break;
        default:
            return state;
    }
}
