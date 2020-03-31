import { createStore, applyMiddleware } from 'redux';
import { enableBatching } from 'redux-batched-actions';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';
import promise from 'redux-promise';
import rootReducers from '../reducers/index.js';
import { reduxLoggerConfig } from './configureReduxLogger';

let middlewares = [
  thunkMiddleware,
  promise,
];

if (process.env.REDUX_LOGGER || process.env.NODE_ENV === 'development') {
  middlewares.push(createLogger( reduxLoggerConfig ));
}

export default function configureStore(persistedState) {
  return createStore(
    enableBatching(rootReducers),
    persistedState,
    applyMiddleware(...middlewares),
  );
}
