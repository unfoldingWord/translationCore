const assert = require('chai').assert;
const CoreActions = require('../src/js/actions/CoreActions.js');
const CoreStore = require('../src/js/stores/CoreStore.js');

function onlineStatus() {
  var onlineStatus = CoreStore.getOnlineStatus();
  assert.isTrue(onlineStatus);
}

describe('CoreStore and CoreActions', function() {
  it('CoreStore should be able to add an event listener', function() {
    CoreStore.addChangeListener(onlineStatus);
    CoreActions.updateOnlineStatus(true);
  });
  it('CoreStore should still update when a nonrelated event occurs', function() {
    CoreActions.updateCheckModal(true);
  });
  it('CoreStore should be able to remove an event listener', function() {
    CoreStore.removeChangeListener(onlineStatus);
    CoreActions.updateOnlineStatus(false);
  });
});
