import {createStore, applyMiddleware} from 'redux';
import { enableBatching } from 'redux-batched-actions';
import thunkMiddleware from 'redux-thunk';
import promise from 'redux-promise';
import rootReducers from '../reducers/index.js';
import { createLogger } from 'redux-logger';

let middlewares = [
  thunkMiddleware,
  promise
];

if (process.env.REDUX_LOGGER || process.env.NODE_ENV === 'development') {
  middlewares.push(createLogger());
}

export default function configureStore(persistedState) {
  return createStore(
    enableBatching(rootReducers),
    persistedState,
    applyMiddleware(...middlewares)
  );
}
