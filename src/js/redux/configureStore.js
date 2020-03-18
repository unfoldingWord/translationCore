import { createStore, applyMiddleware } from 'redux';
import { enableBatching } from 'redux-batched-actions';
import thunkMiddleware from 'redux-thunk';
import promise from 'redux-promise';
import { createLogger } from 'redux-logger';
import rootReducers from '../reducers/index.js';
import {stringifySafe} from "../helpers/FeedbackHelpers";

let middlewares = [
  thunkMiddleware,
  promise,
];

// TRICKY: this is to limit nesting in logging to prevent crashing console.log()
const maxStateLevel = 4; // maximum depth for state logging, can set up to 5 (warning this will run more slowly and consume more memory)
const showFullDepth = true; // set this to true to display deep objects as JSON strings rather than ellipsis (warning this will run more slowly and consume more memory)
const stateTransformer = (state, level = maxStateLevel) => {
  if (level <= 0) {
    return showFullDepth ? stringifySafe(state) : "…"; // at this point replace with string to protect console.log() from objects too deep
  }

  let newState = {};
  let keys = (typeof state === "object" && state !== null && Object.keys(state)) || [];

  if (keys.length) {
    for (let i = 0, l = keys.length; i < l; i++) {
      const key = keys[i];
      newState[key] = stateTransformer(state[key], level - 1);
    }
  } else {
    newState = state;
  }

  return newState;
};

if (process.env.REDUX_LOGGER || process.env.NODE_ENV === 'development') {
  middlewares.push(createLogger(
    {
      diff: false,
      logErrors: false, // disable catch and rethrow of errors in redux-logger
      stateTransformer,
      actionTransformer: stateTransformer,
    }
  ));
}

export default function configureStore(persistedState) {
  return createStore(
    enableBatching(rootReducers),
    persistedState,
    applyMiddleware(...middlewares)
  );
}
