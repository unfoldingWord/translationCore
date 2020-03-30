/* eslint-disable no-unused-vars,object-curly-newline */
import { createStore, applyMiddleware } from 'redux';
import { enableBatching } from 'redux-batched-actions';
import thunkMiddleware from 'redux-thunk';
import promise from 'redux-promise';
import rootReducers from '../reducers/index.js';
import { stringifySafe } from '../helpers/FeedbackHelpers';
import { createLogger } from './index';

let middlewares = [
  thunkMiddleware,
  promise,
];

function safeLogging(state) {
  return stringifySafe(state,
    '[error loading system information]');
}

// TRICKY: this is to limit nesting in logging to prevent crashing console.log()
const maxStateLevel = 4; // maximum depth for state logging, can set up to 5 (warning this will run more slowly and consume more memory)
const showFullDepth = true; // set this to true to display deep objects as JSON strings rather than ellipsis (warning this will run more slowly and consume more memory)
const limitAll = true;

const stateTransformerSub = (state, level = maxStateLevel, stringify = showFullDepth) => {
  if (level <= 0) {
    try {
      return stringify ? JSON.stringify(state) : '…'; // at this point replace with string to protect console.log() from objects too deep
    } catch (e) {
      return `Crash converting to JSON: ${e.toString()}`;
    }
  }

  let newState = {};
  let keys = (typeof state === 'object' && state !== null && Object.keys(state)) || [];

  if (keys.length) {
    for (let i = 0, l = keys.length; i < l; i++) {
      const key = keys[i];
      newState[key] = stateTransformer(state[key], level - 1, stringify);
    }
  } else {
    newState = state;
  }

  return newState;
};

const stateTransformer = (state, level = maxStateLevel, stringify = showFullDepth) => {
  const limitReducers = {
    toolsReducer: { level: 3, stringify: false },
  };

  let newState = {};
  let keys = (typeof state === 'object' && state !== null && Object.keys(state)) || [];

  if (keys.length) {
    for (let i = 0, l = keys.length; i < l; i++) {
      const key = keys[i];

      if (limitReducers && limitReducers.hasOwnProperty(key)) {
        const reduxLimit = limitReducers[key];
        const reduxLevel = reduxLimit.level;
        // console.log(`limiting ${key} to ${reduxLevel}`);

        if (reduxLevel) {
          newState[key] = stateTransformerSub(state[key], reduxLevel, reduxLimit.stringify);
        } else {
          newState[key] = '…';
        }
      } else if (limitAll) {
        newState[key] = stateTransformerSub(state[key], level - 1, stringify);
      } else {
        newState[key] = state[key];
      }
    }
  } else {
    newState = state;
  }

  return newState;
};


if (process.env.REDUX_LOGGER || process.env.NODE_ENV === 'development') {
  //TODO: this is a hack to keep redux logger from crashing, but still saw crash when opened project
  middlewares.push(createLogger(
    {
      diff: false,
      logErrors: false, // disable catch and rethrow of errors in redux-logger
      stateTransformer,
      actionTransformer: (state) => (stateTransformerSub(state,3)),
      // stateTransformer: (state) => (safeLogging(state)),
    },
  ));
}

export default function configureStore(persistedState) {
  return createStore(
    enableBatching(rootReducers),
    persistedState,
    applyMiddleware(...middlewares),
  );
}
