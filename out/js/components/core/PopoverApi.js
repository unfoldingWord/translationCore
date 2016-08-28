const CoreActions = require('../../actions/CoreActions.js');

function PopoverApi(visibility, title, body, left, top) {
  CoreActions.updatePopover(visibility, title, body, left, top);
}

module.exports = PopoverApi;