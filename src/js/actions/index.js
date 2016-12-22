var EventEmitter = require('events').EventEmitter;

class Actions extends EventEmitter {
  constructor() {
    super();
    this.reducer = [];
  }
  sendAction(eventName, actionObj) {
    this.reducer[eventName] = actionObj;
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
    return this.reducer[actionType];
  }
}

module.exports = new Actions();
