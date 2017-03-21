import React from 'react'
import { Provider } from 'react-redux'
import configureStore from '../utils/configureStore'
import Application from './app'
import { loadState, saveState } from '../utils/localStorage'
import throttle from 'lodash/throttle'
//loading persistedState from filesystem using loadState()
const persistedState = loadState();
const store = configureStore(persistedState)
/** @description:
 * The app store will be saved on state changes
 * subscribe listens for change in store
 * throttle makes the state to be save only once per second (1000),
 * which could be increase if we need to
 */
store.subscribe(throttle(() => {
  saveState(store.getState());
}, 1000));

module.exports.App = (
  <Provider store={store}>
    <Application />
  </Provider>
);
module.exports.dispatch = store.dispatch;
