var Dispatcher = require('./Dispatcher');
var consts = require('./CoreActionConsts');
/**
How to use the actions:
Just require this file in your component, call
one of the functions and the event will automatically
be dispatched to all of the stores that have registered
listener
<<<<<<< HEAD
=======
(See ExampleComponent.js)
>>>>>>> f9a902cd6ce4624b3751918a67ac67d29cbc6869

*/
module.exports = {
  nextCheck: function(newVerse) {
    Dispatcher.handleAction({
      type: consts["NewVerse"],
      newVerse: newVerse
    });
  },
  addCheck: function(newCheck) {
    Dispatcher.handleAction({
      type: consts["AddCheck"],
      newCheck: newCheck
    });
  },

  addToExampleComponentText: function() {
    Dispatcher.handleAction({
      type: "ADD_TO_TEXT"
    });
  }

};