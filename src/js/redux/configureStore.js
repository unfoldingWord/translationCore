import {createStore, applyMiddleware} from 'redux';
import thunkMiddleware from 'redux-thunk';
import promise from 'redux-promise';
import rootReducers from '../reducers/index.js';
import { createLogger } from 'redux-logger';

let middlewares = [
  thunkMiddleware,
  promise
];

// if REDUX_LOGGER=true add redux-logger to middlewares
if (process.env.REDUX_LOGGER) {
  middlewares.push(createLogger());
}

export default function configureStore(persistedState) {
  return createStore(
    rootReducers,
    persistedState,
    applyMiddleware(...middlewares)
  );
}
