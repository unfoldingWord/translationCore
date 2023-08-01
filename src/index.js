import { exec } from 'child_process';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './js/pages/root';
import * as serviceWorker from './serviceWorker';
import { createElectronHandler, registerLogHandler } from './logger';

// forward logs to electron's main thread
if (process.env.NODE_ENV === 'production') {
  registerLogHandler(createElectronHandler('log-event'));
}

// call system git to retrieve its version
exec('git --version', (err, data) => {
  if (err) {
    console.error('System Git ERROR:', err);
  } else {
    console.info('System Git Identifier:', data);
  }
});
// log versions
console.info('Electron', process.versions.electron);
console.info('Chrome', process.versions.chrome);
console.info('Node', process.versions.node);

ReactDOM.render(<App/>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
