import React from 'react';
import { Provider } from 'react-redux';
import { LocalizeProvider } from 'react-localize-redux';
import setupSubscriptions from 'redux-subscriptions';
import configureStore from '../redux/configureStore';
import { loadState, saveState } from '../localStorage';
import Application from './app';

//loading persistedState from filesystem using loadState()
const persistedState = loadState();
const store = configureStore(persistedState);

/** @description:
 * The app store will be saved on state changes
 * subscribe listens for change in store
 * throttle makes the state to be save only once per second (1000),
 * which could be increase if we need to
 */
// TODO: figure out if throttle is still needed and if so, figure out how to use it with setupSubscriptions
// store.subscribe(throttle(() => {
//   saveState(store.getState());
// }, 1000));
store.subscribe(setupSubscriptions(store)(
  ({ prevState, newState }) => {
    saveState(prevState, newState);
  }
));

module.exports.App = (
  <Provider store={store}>
    <LocalizeProvider store={store}>
      <Application />
    </LocalizeProvider>
  </Provider>
);
module.exports.dispatch = store.dispatch;
