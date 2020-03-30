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
const maxStateLevel = 5; // maximum depth for state logging
const showFullDepth = true; // set this to true to display deep objects as JSON strings rather than ellipsis (warning this will run more slowly and consume more memory)
const limitStringify = { level: 4, stringify: true };
const limitNoStringify = { level: 4, stringify: false };
const noLimit = { level: 4, noLimit: true };
const defaultLimit = noLimit; // limit to use for reducers not specified
const limitReducers = {
  projectDetailsReducer: limitStringify,
  resourcesReducer: { level: 3, stringify: true },
  toolsReducer: { level: 4, stringify: false },
};

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
      newState[key] = stateTransformerSub(state[key], level - 1, stringify);
    }
  } else {
    newState = state;
  }

  return newState;
};

const stateTransformer = (state, level = maxStateLevel, stringify = showFullDepth) => {
  let newState = {};
  let keys = (typeof state === 'object' && state !== null && Object.keys(state)) || [];

  if (keys.length) {
    for (let i = 0, l = keys.length; i < l; i++) {
      const key = keys[i];
      const haveLimit = (limitReducers && limitReducers.hasOwnProperty(key));
      const reduxLimit = haveLimit ? limitReducers[key] : defaultLimit;
      let limit_ = true;

      if (reduxLimit.noLimit) {
        limit_ = false;
      } else {
        const reduxLevel = reduxLimit.level;
        // console.log(`limiting ${key} to ${reduxLevel}`);

        if (reduxLevel) {
          // console.log(`stateTransformer() - key - ${key}, reduxLevel = ${reduxLevel}`);
          newState[key] = stateTransformerSub(state[key], reduxLevel, reduxLimit.stringify);
        } else {
          // console.log(`stateTransformer() - key - ${key}, elipsis`);
          newState[key] = '…';
        }
        continue;
      }

      if (limit_) {
        // console.log(`stateTransformer() - key - ${key}, level = ${level}`);
        newState[key] = stateTransformerSub(state[key], level - 1, stringify);
      } else {
        // console.log(`stateTransformer() - key - ${key}, unlimited`);
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
