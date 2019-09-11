import DownloadManager from '../src/js/DownloadManager';

const manager = new DownloadManager();

const Item = () => {
  let callback = null;

  return {
    once: (key, cb) => callback = cb,
    done: () => {
      callback();
    },
  };
};

test('add/get/delete item', () => {
  const item = new Item();
  const id = manager.add(item);
  expect(id).toBeTruthy();
  const retrievedItem = manager.get(id);
  expect(item).toBe(retrievedItem);
  item.done();
  expect(manager.get(id)).not.toBeDefined();
});
