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

if (process.env.REDUX_LOGGER || process.env.NODE_ENV === 'development') {
  //TODO: this is a hack to keep redux logger from crashing, but still saw crash when opened project
  middlewares.push(createLogger(
    {
      diff: false,
      actionTransformer: (state) => (safeLogging(state)),
      stateTransformer: (state) => (safeLogging(state)),
      // logger: {
      //   log: (...data) => safeLog(...data),
      //   warn: (...data) => safeLog(...data),
      //   error: (...data) => safeLog(...data),
      // },

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
