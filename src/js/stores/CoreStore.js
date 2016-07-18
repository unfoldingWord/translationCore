var EventEmitter = require('events').EventEmitter;
var Dispatcher = require('../dispatchers/Dispatcher');
/**

Keep pretty much all business logic and data in
here. Make methods so components can retrieve
that data.

How to use the store:
Require this file in your component, and call
methods to get whatever data you need. Also include
the following snippet in your component:

  componentWillMount() {
    CoreStore.addChangeListener(this.{YOUR METHOD HERE});
  }

  componentWillUnmount() {
    CoreStore.removeChangeListener(this.{YOUR METHOD HERE});
  }

This will make it so your component will be subscribed
to the store and listen for the store's emits. The store
sends an emit when its data changes, and any subscribed
component will hear it and be able to ask for updated data.
(See ExampleComponent.js)

*/

class CoreStore extends EventEmitter {
  constructor() {
    super();

  }

}

const coreStore = new CoreStore;
Dispatcher.register(coreStore.handleActions.bind(coreStore));
module.exports = coreStore;
