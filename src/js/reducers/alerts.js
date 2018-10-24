import types from '../actions/ActionTypes';

const initialState = {
  byProps: [],
  byId: [],
  ignored: []
};

const alert = (state = {}, action) => {
  switch (action.type) {
    case types.OPEN_ALERT:
      // TRICKY: most of the fields are optional
      return {
        ...action,
        id: action.id,
        children: action.children ? action.children : action.message
      };
    default:
      return state;
  }
};

/**
 * Manages alert state.
 * This simply holds a list of alert objects to be displayed.
 * Alerts are given an id so we can dismiss them.
 * @param state
 * @param action
 * @return {*}
 */
const alerts = (state = initialState, action) => {
  switch (action.type) {
    case types.OPEN_ALERT: {
      const newState = removeAlert(state, action.id);
      return {
        ...newState,
        byId: [
          ...newState.byId,
          action.id
        ],
        byProps: [
          ...newState.byProps,
          alert(null, action)
        ]
      };
    }
    case types.IGNORE_ALERT: {
      let ignored = [...state.ignored];
      if (action.ignore) {
        ignored.push(action.id);
      } else {
        ignored = ignored.filter(id => id !== action.id);
      }
      return {
        ...state,
        ignored
      };
    }
    case types.CLOSE_ALERT:
      return removeAlert(state, action.id);
    default:
      return state;
  }
};

export default alerts;

const removeAlert = (state, id) => {
  const index = state.byId.indexOf(id);
  if (index >= 0) {
    return {
      byProps: state.byProps.splice(index, 1),
      byId: state.byId.splice(index, 1)
    };
  } else {
    return state;
  }
};

export const getAlerts = (state) => {
  return [...state.byProps];
};
