import types from '../actions/ActionTypes';

const initialState = { open: false };

const softwareUpdate = (state = initialState, action) => {
  switch (action.type) {
  case types.OPEN_SOFTWARE_UPDATE:
    return { open: true };
  case types.CLOSE_SOFTWARE_UPDATE:
    return { open: false };
  default:
    return state;
  }
};

export default softwareUpdate;

export const getIsOpen = (state) => state && state.open;
