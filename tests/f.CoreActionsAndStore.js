const assert = require('chai').assert;
const CoreActions = require('../src/js/actions/CoreActions.js');
const CoreStore = require('../src/js/reducers/coreStoreReducer');

function onlineStatus() {
  var onlineStatus = CoreStore.getOnlineStatus();
  assert.isTrue(onlineStatus);
}

describe('CoreStore and CoreActions', function() {
  it('CoreStore should throw an error if no callback is specified', function() {
    try {
      CoreStore.addChangeListener();
      assert.isTrue(false);
    } catch(err) {
      assert.isTrue(true)
    }
  });
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
