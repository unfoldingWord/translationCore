import consts from '../actions/CoreActionConsts'

const initialState = {
    enabled: false,
    userName: null,
    modifiedTimestamp: null
}

const remindersReducer = (state = initialState, action) => {
    switch(action.type) {
        case consts.TOGGLE_REMINDER:
            return Object.assign({}, state, {
                enabled: !state.enabled,
                userName: action.userName,
                modifiedTimestamp: action.modifiedTimestamp
            });
        default:
            return state;
    }
}

export default remindersReducer;