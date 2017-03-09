import React from 'react'
import { Provider } from 'react-redux'
import configureStore from './configureStore'
import Application from './app'

const store = configureStore()

module.exports.App = (
  <Provider store={store}>
    <Application />
  </Provider>
);
module.exports.dispatch = store.dispatch;
