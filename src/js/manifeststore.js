var EventEmitter = require('events').EventEmitter;

class ManifestStore extends EventEmitter {
  constructor(text) {
    super();
    this.storedText = text;
  }

  changeText(newText) {
    this.storedText = newText;
    this.emit("change", this.storedText);
  }
}

var store = new ManifestStore();

module.exports = store;
