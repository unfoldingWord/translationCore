var Dispatcher = require('./Dispatcher');
var consts = require('./CoreActionConsts');
/**
How to use the actions:
Just require this file in your component, call
one of the functions and the event will automatically
be dispatched to all of the stores that have registered
listener


*/
module.exports = {
  nextCheck: function(newVerse) {
    Dispatcher.handleAction({
      action: consts["NewVerse"],
      newVerse: newVerse
    });
  },
  addCheck: function(newCheck) {
    Dispatcher.handleAction({
      action: consts["AddCheck"],
      newCheck: newCheck
    });
  }

};
