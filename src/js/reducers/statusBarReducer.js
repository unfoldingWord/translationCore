import consts from '../actions/ActionTypes';

const initialState = {
    online: true
};

const statusBarReducer = (state = initialState, action) => {
    switch (action.type) {
        case consts.CHANGE_ONLINE_STATUS:
          return { ...state, online: action.online }
        default:
            return state;
    }
}

export default statusBarReducer;
