/**
 * @author Ian Hoegen
 * @description: This module handles the uploading of files and the callback.
 ******************************************************************************/
const FileModule = (function() {
  const fs = require(window.__base + 'node_modules/fs-extra');
  const request = require('request');

  return {
    /**
     * @description: This function reads a file and returns the text that is
     *               contained within the file.
     * @author: Ian Hoegen
     * @param {string} file - A filepath that is chosen by a user
     * @param {function} callback - A callback function to be executed after reading
     * @param {string} source - The file path that the file is from
     ******************************************************************************/
    readFile: function(file, callback) {
      var inputFile = fs.readFileSync(file).toString();
      callback(inputFile);
    },

    /**
     * @description: This function reads a JSON file and returns the text that is
     *               contained within the file.
     * @author: Logan Lebanoff
     * @param {string} file - A filepath that is chosen by a user
     * @param {function} callback - A callback function to be executed after reading
     ******************************************************************************/
    readJsonFile: function(file, callback) {
      var inputFile = fs.readFileSync(file).toString();
      var jsonObject = JSON.parse(inputFile);
      callback(jsonObject);
    },

    loadOnline: function(url, callback, extraData) {
      request(url, function(error, response, body) {
        callback(error, response, body, extraData);
      });
    }
  };
}
)();
module.exports = FileModule;
