import consts from '../actions/ActionTypes';

const initialState = {
    project: {
        showModal: false,
        modalTitle: "Create Project",
        doneText: "Load",
        loadedChecks: [],
        currentChecks: [],
        modalValue: "Languages",
        backButton: 'hidden'
    },
    login_profile: {
        loginModalVisibility: false,
        profileModalVisibility: false,
        showModal: false
    },
    switch_check: {
        showModal: false
    }
}
module.exports = (state = initialState, action) => {
    switch (action.type) {
        case consts.CREATE_PROJECT:
          const visible = action.createProjectModal ? true : false;
          return {
            ...state,
            project: {
              ...state.project,
              createProjectModal: action.createProjectModal,
              showModal: visible
            }
          }
        case consts.CHANGE_LOGIN_MODAL_VISIBILITY:
          return {
            ...state,
            login_profile: {
              ...state.login_profile,
              loginModalVisibility: action.val
            }
          }
        case consts.CHANGE_PROFILE_MODAL_VISIBILITY:
          return {
            ...state,
            login_profile: {
              ...state.login_profile,
              profileModalVisibility: action.val
            }
          }
        case consts.SHOW_PROFILE_LOGIN_MODAL:
          return {
            ...state,
            login_profile: {
              ...state.login_profile,
              showModal: action.val
            }
          }
        case consts.SHOW_SWITCH_CHECK_MODAL:
          return {
            ...state,
            switch_check: {
              ...state.switch_check,
              showModal: action.val
            }
          }
        default:
            return state;
    }
}
