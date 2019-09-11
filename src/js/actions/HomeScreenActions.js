import { getFeedbackCloseCallback } from '../selectors/index';
import consts from './ActionTypes';

/**
 * open feedback dialog with this message
 * @param {string} message
 * @return {{type: string, val: *}}
 */
export function setErrorFeedbackMessage(message) {
  return {
    type: consts.ERROR_FEEDBACK_MESSAGE,
    val: message,
  };
}

/**
 * additional error details to provide feedback dialog submission
 * @param {string} details
 * @return {{type: string, val: *}}
 */
export function setErrorFeedbackDetails(details) {
  return {
    type: consts.ERROR_FEEDBACK_DETAILS,
    val: details,
  };
}

/**
 * the category for error feedback dialog submission
 * @param {string} details
 * @return {{type: string, val: *}}
 */
export function setErrorFeedbackCategory(details) {
  return {
    type: consts.ERROR_FEEDBACK_CATEGORY,
    val: details,
  };
}

/**
 * set callback function for when feedback closes
 * @param {function} callback
 * @return {{type: string, val: *}}
 */
export function setFeedbackCloseCallback(callback) {
  return {
    type: consts.FEEDBACK_CALLBACK_ON_CLOSE,
    val: callback,
  };
}

export function feedbackDialogClosing() {
  return ((dispatch, getState) => {
    let callback = getFeedbackCloseCallback(getState());
    dispatch(setErrorFeedbackMessage('')); // clear message that caused the popup
    dispatch(setErrorFeedbackCategory(null)); // clear category
    dispatch(setErrorFeedbackDetails('')); // clear error details
    dispatch(setFeedbackCloseCallback(null)); // remove callback function
    new Promise(() => {
      if (callback) {
        callback();
        callback = null;
      }
    });
  });
}
