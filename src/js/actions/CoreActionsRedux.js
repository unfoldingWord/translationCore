var consts = require('./CoreActionConsts');
/**
How to use the actions:
Just require this file in your component, call
one of the functions and the event will automatically
be dispatched to all of the stores that have registered
listener
(See ExampleComponent.js)
*/

module.exports.showMainView = function(val) {
  return {
    type: consts.SHOW_APPS,
    val:val
  }
}

module.exports.changeModuleView = function(val) {
  return {
    type: consts.CHANGE_WRAPPER_VIEW,
    val:val
  }
}
