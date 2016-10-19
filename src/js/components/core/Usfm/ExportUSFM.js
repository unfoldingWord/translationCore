const usfm = require('usfm-parser');
const fs = require(window.__base + 'node_modules/fs-extra');
const path = require('path');
const {dialog} = require('electron').remote;
const api = window.ModuleApi;

/**
 * @description This function takes JSON and a save location, exporting it as USFM.
 * @param {Object} json - The scripture in json format.
 * @param {Object} reorder - Whether or not the structure needs to be formatted
 * @param {String} saveLocation - The save location for the usfm file.
 * @param {Object} nameflag - Appends to the book name.
 * @param {Object} callback - To be called on completion.
 ******************************************************************************/
function exportUsfm(json, reorder, saveLocation, nameflag, callback) {
  if (reorder) {
    var book = json;
    var finalJson = {chapters: []};
    for (var bookName in book) {
      finalJson.book = bookName;
      for (var chapter in book[bookName]) {
        var verseArray = [];
        for (var verse in book[bookName][chapter]) {
          verseArray.push({
            number: verse,
            text: book[bookName][chapter][verse]
          });
        }
        finalJson.chapters.push({number: chapter, verses: verseArray});
      }
    }
    fs.writeFile(saveLocation + '/' + finalJson.book + nameflag + '.usfm', usfm.toUSFM(finalJson));
  } else {
    var saveName = json.book + nameflag + '.usfm';
    var saveFilePath = path.join(saveLocation, saveName);
    var jsonToUsfm = usfm.toUSFM(json);
    fs.writeFile(saveFilePath, jsonToUsfm, callback);
  }
}
exports.exportUsfm = exportUsfm;
/**
 * @description This function takes the original, gateway, and target language,
 *              and exports it to a USFM file.
 ******************************************************************************/
function exportAllBooks() {
  dialog.showOpenDialog({properties: ['openDirectory']}, function(savePath) {
    var params = api.getDataFromCommon('params');
    if (params) {
      debugger;
      var fileName = require('../BooksOfBible.js')[params.bookAbbr];
      var book = require('../../../../../static/ulgb/' + fileName + '.json');
      exportUsfm(book, true, savePath, 'Greek');
    }
    var gateway = api.getDataFromCommon('gatewayLanguage');
    if (gateway) {
      var bookTitle = gateway.title;
      delete gateway.title;
      var finalJson = {};
      finalJson[bookTitle] = gateway;
      exportUsfm(finalJson, true, savePath, 'English');
    }
    var target = api.getDataFromCommon('targetLanguage');
    if (target) {
      var bookTitle = target.title;
      delete target.title;
      var finalJson = {};
      finalJson[bookTitle] = target;
      exportUsfm(finalJson, true, savePath, 'Target');
    }
  });
}

exports.exportAll = exportAllBooks;
