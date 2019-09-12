import {createStore, applyMiddleware, compose} from 'redux';
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
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  return createStore(
    enableBatching(rootReducers),
    persistedState,
    composeEnhancers(
      applyMiddleware(...middlewares)
    )
  );
}
