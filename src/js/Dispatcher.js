var fluxDispatch = require('flux').Dispatcher;
var Dispatcher = new fluxDispatch();

Dispatcher.handleAction = function(action) {
<<<<<<< HEAD
  this.dispatch({
    source: 'VIEW_ACTION',
    action: action
  });
=======
  action.source = 'VIEW_ACTION';
  this.dispatch(
      action
  );
>>>>>>> f9a902cd6ce4624b3751918a67ac67d29cbc6869
};
module.exports = Dispatcher;
/**
Stores can require this file and call register(callback)
to have that callback run whenever anything is dispatched by an
action. The callback function shoudl take in a single parameter
(lets call it "disData" for this example)
In the callback, you can look at disData.action to get the
type of action that occured and ignore or react as appropriate

Right now the source of every action is from the view, so this
is the only function that I included. More functions that take actions
from different cources can easily be added later if they are needed
*/
