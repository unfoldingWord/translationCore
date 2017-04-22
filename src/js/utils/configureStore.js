import {createStore, applyMiddleware} from 'redux';
import thunkMiddleware from 'redux-thunk';
import rootReducers from '../reducers/index.js';

//  preloadedState will be used for Data persistence

export default function configureStore(persistedState) {
  return createStore(
    rootReducers,
    persistedState,
    applyMiddleware(
      thunkMiddleware
    )
  );
}
