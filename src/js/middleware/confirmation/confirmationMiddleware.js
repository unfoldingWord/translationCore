/**
 * This middleware allows you to display a confirmation before an action is executed.
 * For example, receive confirmation before deleting a file.
 * This is especially helpful when you have lots of different kinds of actions
 * that need some sort of confirmation. Without this middleware you would need a reducer for
 * each confirmation case.
 *
 * To add confirmation to your actions you need to add a `meta` field to the action object.
 * This works well if you don't have any side-effects.
 * ```
 * {
 *   ...
 *   meta: {
 *     shouldConfirm: true,
 *     tile: "Optional Dialog Title",
 *     message: "Message to display in the confirmation dialog",
 *     confirmButtonText: "Approve",
 *     cancelButtonText: "Cancel",
 *   }
 * }
 * ```
 *
 * Alternatively, you can call `confirmAction`. This allows you to dispatch more complex actions
 * such as thunks that produce side-effects.
 *
 * ```
 * dispatch(confirmAction({ message: "Are you sure" }, (disp) => {
 *   // This thunk is dispatched when confirmed
 *   disp({
 *     ...
 *   });
 * }));
 * ```
 */

// Action types

const types = {
  CONFIRMATION_APPROVED: '@confirmation-approved',
  CONFIRMATION_REQUEST: '@confirmation-request',
  CONFIRMATION_REJECTED: '@confirmation-rejected',
};

// Middleware

/**
 * Put this at the front of your middleware array when configuring redux.
 * @param store
 * @returns {function(*): function(...[*])}
 */
export const confirmationMiddleware = store => next => action => {
  if (action.type === types.CONFIRMATION_APPROVED) {
    console.log(action);
    // allow the original action
    next(action.action);
    return next(action);
  } else if (action.meta && action.meta.shouldConfirm) {
    // display confirmation before executing action
    return next({
      type: types.CONFIRMATION_REQUEST,
      meta: action.meta,
      action,
    });
  } else {
    return next(action);
  }
};

// Reducer

const INITIAL_STATE = [];

export const confirmationReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
  case types.CONFIRMATION_REQUEST:
    return [
      ...state,
      {
        meta: action.meta,
        action: action.action,
      },
    ];
  case types.CONFIRMATION_REJECTED:
  case types.CONFIRMATION_APPROVED:
    return state.slice(0, state.length - 1);
  default:
    return state;
  }
};

// Selectors

export const getNextConfirmation = state => {
  if (state && state.length > 0) {
    return state[0];
  } else {
    return null;
  }
};


// Actions

export const rejectConfirmation = (action) => ({
  type: types.CONFIRMATION_REJECTED,
  action,
});
export const approveConfirmation = (action) => ({
  type: types.CONFIRMATION_APPROVED,
  action,
});
/**
 * Manually insert a confirmation request.
 * This allows you to build more complex logic.
 * For example, you could execute a thunk on approval.
 * @param confirmProps - properties passed to the confirmation dialog
 * @param action - the action to execute if approved.
 * @returns {{action: *, type: string}}
 */
export const confirmAction = (confirmProps, action) => ({
  type: types.CONFIRMATION_REQUEST,
  meta: confirmProps,
  action,
});
