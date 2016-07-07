var EventEmitter = require('events').EventEmitter;
var Dispatcher = require('../dispatchers/Dispatcher');
var consts = require("../actions/CoreActionConsts.js");

var CHANGE_EVENT = 'change';
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

    // Initialize CoreStore's fields here...
    this.exampleComponentText = "init";
    this.checkType = "Hamburger";
  }

  getCurrentCheckType() {
    return this.checkType;
  }

  getExampleComponentText() {
    return this.exampleComponentText;
  }

  getOriginalLanugage() {
    return this.ol;
  }

  getTargetLanugage() {
    return this.tl;
  }

  getGatewayLanguage() {
    return this.gl;
  }

  getModal() {
    return this.modalVisibility;
  }

  emitChange() {
    this.emit(CHANGE_EVENT);
  }


  getLoginModal(){
    return this.loginModalVisibility;
  }

  /**
   * @param {function} callback
   */
  addChangeListener(callback) {
    this.on(CHANGE_EVENT, callback);
  }

  removeChangeListener(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  }

  handleActions(action) {
    switch (action.type) {
      case consts["AddCheck"]:
        // change some data here...

        // Emits that a change was made, so any component listening for
        // this store can update its data
        this.emitChange();
        break;

      case consts["NextVerse"]:
        // change some data here...
        this.emitChange();
        break;

      case consts["PrevVerse"]:
        // change some data here...
        this.emitChange();
        break;

      // For ExampleComponent
      case "ADD_TO_TEXT":
        this.exampleComponentText += "a";
        this.emitChange();
        break;

      case consts["UpdateOl"]:
        this.ol = action.bookOl;
        this.emitChange();
        break;

      case consts["UpdateTl"]:
        this.tl = action.bookTl;
        this.emitChange();
        break;

      case consts["UpdateGl"]:
        this.gl = action.bookGl;
        this.emitChange();
        break;

      case consts["UpdateModal"]:
        this.modalVisibility = action.modalOption;
        this.emitChange();
        break;
      case consts["ChangeCheck"]:
        this.checkType = action.newCheck;
        this.emitChange();
        break;

        //manny
      case consts["LoadLoginModal"]:
        this.loginModalVisibility = action.loginModalOption;
        this.emitChange();
        break;

      default:
        // do nothing
    }
  }

}

const coreStore = new CoreStore;
Dispatcher.register(coreStore.handleActions.bind(coreStore));
module.exports = coreStore;
