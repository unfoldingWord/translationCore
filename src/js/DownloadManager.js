const uuid = require('uuid/v4');

/**
 * This is a utility for managing download items
 * @return {{add: function(DownloadItem), get: function(string)}}
 * @constructor
 */
function DownloadManager() {
  const downloads = {};

  /**
   * Adds a new download item
   * @param {DownloadItem} item the download item to be added
   * @return {string} the download id
   */
  const addItem = (item) => {
    const id = uuid();
    downloads[id] = item;
    // clean up
    item.once('done', () => {
      delete downloads[id];
    });
    return id;
  };

  /**
   * Retrieves a download item
   * @param {string} id the download id
   * @return {DownloadItem} the download item or undefined
   */
  const getItem = (id) => downloads[id];

  return {
    add: addItem,
    get: getItem,
  };
}

module.exports = DownloadManager;
