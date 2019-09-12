import types from '../actions/ActionTypes';

const initialState = {
  props: [],
  ignored: [],
};

const alert = (state = {}, action) => {
  switch (action.type) {
  case types.OPEN_ALERT: {
    // TRICKY: most of the fields are optional
    const alert = { ...action };
    delete alert.message;
    delete alert.type;

    return {
      ...alert,
      id: action.id,
      children: action.children ? action.children : action.message,
    };
  }
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
    // TRICKY: short circuit if alert is ignored
    const hasIgnore = typeof action.onIgnore === 'function';

    if (hasIgnore && state.ignored.indexOf(action.id) >= 0) {
      return state;
    }

    // add alert
    const oldProps = state.props.filter(item => item.id !== action.id);
    return {
      ...state,
      props: [
        ...oldProps,
        alert(null, action),
      ],
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
      ignored,
    };
  }
  case types.CLOSE_ALERT:
    return {
      ...state,
      props: state.props.filter(item => item.id !== action.id),
    };
  case types.LOGOUT_USER:
    return initialState;
  default:
    return state;
  }
};

export default alerts;

export const getAlerts = (state) => [...state.props];

/**
 * find alert that matches id
 * @param {Object} state
 * @param {String} id of alert to find
 * @return {*} found alert
 */
export const findAlert = (state, id) => state.alerts.props.find(item => item.id === id);
