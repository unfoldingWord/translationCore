var consts = require('../actions/CoreActionConsts');


initialState = {
      showModal: false,
      modalTitle: "Create Project",
      doneText: "Load",
      loadedChecks: [],
      currentChecks: [],
      modalValue: "Languages",
      backButton: 'hidden'
}
module.exports = function projectModal(state = initialState, action) {
    switch (action.type) {
        case consts.CREATE_PROJECT:     
        debugger;
            const visible = action.createProjectModal ? true : false;
            return Object.assign({}, state, {createProjectModal: action.createProjectModal, showModal: visible});
            break;
        default:
            return state;
    }
}