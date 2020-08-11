let mockState = Object.create(null);

/**
 * Set the response data
 * @param response
 * @private
 */
const __setResponse = (response) => {
  mockState.response = response;
};

/**
 * Set the failure message
 * @param msg the message or undefined if there should be no failure
 * @private
 */
const __setFailure = (msg) => {
  if (msg !== undefined) {
    mockState.failure = msg;
  } else {
    delete mockState.failure;
  }
};

/**
 * Generates the generic response
 * @param state
 * @return {*}
 */
const makeResponse = (state) => {
  if (state.failure) {
    return Promise.reject(state.failure);
  } else {
    return Promise.resolve(state.response);
  }
};

const download = jest.fn(() => makeResponse(mockState));
const read = jest.fn(() => makeResponse(mockState));

module.exports = {
  __setFailure,
  __setResponse,
  download,
  read,
};
