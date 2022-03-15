// import path from 'path';
import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { LocalizeProvider } from 'react-localize-redux';
import setupSubscriptions from 'redux-subscriptions';
import configureStore from '../redux/configureStore';
import { loadState, saveState } from '../localStorage';
import Application from './app';

import './../../fonts/NotoSans-Bold.ttf';
import './../../fonts/NotoSans-Italic.ttf';
import './../../fonts/NotoSans-Regular.ttf';
import './../../fonts/NotoSans-BoldItalic.ttf';
import './../../fonts/SILEOTSR.ttf';
import './../../fonts/glyphicons-halflings-regular.ttf';
import './../../fonts/glyphicons-halflings-regular.woff';
import './../../fonts/glyphicons-halflings-regular.woff2';
import './../../fonts/glyphicons-halflings-regular.eot';
import './../../fonts/glyphicons-halflings-regular.svg';
import './../../css/styles.css';

// /**
//  * try different configs until one works (different paths for prod and dev)
//  */
// function initDotEnv2() {
//   const dotenv = require('dotenv');
//   const env = dotenv.config()?.parsed;
//   console.log(`initDotEnv2: previous dotenv:`, env);
//   const dotnetEnvPaths = [path.join(__dirname, 'cfg.txt'), path.join(__dirname, '../../../.env')];
//
//   for (const envPath of dotnetEnvPaths) {
//     try {
//       dotenv.config({ path: envPath });
//       const env = dotenv.config()?.parsed;
//
//       if (env && Object.keys(env).length) {
//         console.log(`found env at ${envPath}`, env);
//         break;
//       }
//     } catch (e) {
//       console.log(`initDotEnv2: failed to parse: ${envPath}`, e);
//     }
//   }
// }
//
// initDotEnv2();

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
  },
));

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <LocalizeProvider store={store}>
          <Application/>
        </LocalizeProvider>
      </Provider>
    );
  }
}

export default App;
