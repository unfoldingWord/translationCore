/**
 * @author Ian Hoegen
 * @description: This serves as the new store and events api.
 * @usage:
 * Actions.sendAction('YOUR_EVENT', data) // Emits an event of type YOUR_EVENT, adds data to store
 * Actions.getData('YOUR_EVENT') // Retrieves data from the event emitted
 ***********************************************************************************/

const EventEmitter = require('events').EventEmitter;
const Reducers = require('../reducers');

class Actions extends EventEmitter {
  constructor() {
    super();
    this.store = [];
  }
  sendAction(eventName, actionObj) {
    if(Reducers[eventName]) {
      this.store[eventName] = Reducers[eventName](this.store[eventName], actionObj);
    } else {
      this.store[eventName] = actionObj;
    }
    this.emitChange(eventName);
  }

  subscribe(eventName, callback) {
    this.on(eventName, callback);
  }

  unsubscribe(eventName, callback) {
    this.removeListener(eventName, callback);
  }

  emitChange(eventName, data) {
    this.emit(eventName, data);
  }

  getData (actionType) {
    return this.store[actionType];
  }
}

var actions = new Actions();
module.exports = actions;
