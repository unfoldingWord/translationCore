/* eslint-disable no-return-assign */
import DownloadManager from '../js/DownloadManager';

const manager = new DownloadManager();

class Item {
  constructor() {
    this.callback = null;
  }

  once(key, cb) {
    return this.callback = cb;
  }

  done() {
    this.callback();
  }
}

test('add/get/delete item', () => {
  const item = new Item();
  const id = manager.add(item);
  expect(id).toBeTruthy();
  const retrievedItem = manager.get(id);
  expect(item).toBe(retrievedItem);
  item.done();
  expect(manager.get(id)).not.toBeDefined();
});
