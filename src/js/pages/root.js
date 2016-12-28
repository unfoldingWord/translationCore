const { createStore, applyMiddleware, combineReducers, bindActionCreators } = require('redux');
const { Provider, connect  } = require('react-redux');
const thunk = require('redux-thunk').default
const reducers = require('../Reducers');
const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
const reducer = combineReducers(reducers);
const store = createStoreWithMiddleware(reducer);
const React = require('react');
const Application = require("./app");
module.exports = <Provider store={store}> <Application /> </Provider>