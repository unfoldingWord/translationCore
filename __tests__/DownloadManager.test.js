import DownloadManager from '../src/js/DownloadManager';

const manager = new DownloadManager();

test('add/get/delete item', () => {
  const item = {
    once: (key, callback) => this.callback = callback,
    done: () => {this.callback()}
  };
  const id = manager.add(item);
  expect(id).toBeTruthy();
  const retrievedItem = manager.get(id);
  expect(item).toBe(retrievedItem);
  item.done();
  expect(manager.get(id)).not.toBeDefined();
});
