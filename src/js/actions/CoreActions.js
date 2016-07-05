var Dispatcher = require('../dispatchers/Dispatcher');
var consts = require('./CoreActionConsts');
/**
How to use the actions:
Just require this file in your component, call
one of the functions and the event will automatically
be dispatched to all of the stores that have registered
listener
(See ExampleComponent.js)

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
  },

  updateOriginalLanguage: function(book) {
    Dispatcher.handleAction({
      type: consts["UpdateOl"],
      bookOl: book
    });
  },

  updateTargetLanguage: function(book) {
    Dispatcher.handleAction({
      type: consts["UpdateTl"],
      bookTl: book
    });
  },

  updateGatewayLanguage: function(book) {
    Dispatcher.handleAction({
      type: consts["UpdateGl"],
      bookGl: book
    });
  },

  updateModal: function(boolean) {
    Dispatcher.handleAction({
      type: consts["UpdateModal"],
      modalOption: boolean
    });
  }

};
