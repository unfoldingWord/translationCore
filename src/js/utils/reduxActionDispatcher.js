/**
 *@author: Manny Colon
 *@description: The purpose of this util is so that you can dispatch redux
 *              actions in non-react components files.
 *@example:
 *          1. Require this file as follow:
 *            - const dispatch = require('../utils/reduxActionDispatcher.js').dispatch;
 *          2. Include the actions file you want to use:
 *            - For example,
 *              const SettingsActions = require('../../actions/SettingsActions.js');
 *          3. Then you can use the dispatch function as follow:
 *            - dispatch(SettingsActions.toggleSettings('showTutorial'));
 ******************************************************************************/
const { createStore, applyMiddleware, combineReducers } = require('redux');
const { Provider, connect  } = require('react-redux');
const thunk = require('redux-thunk').default
const reducers = require('../reducers/index.js');
const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
const reducer = combineReducers(reducers);
const store = createStoreWithMiddleware(reducer);

module.exports = {
  dispatch: function(action) {
    store.dispatch(action);
  }
};
