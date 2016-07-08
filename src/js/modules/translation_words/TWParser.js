/**
 * @author Evan "He whose genius knows several bounds" Wiederspan
 * @param {Object} wordList - WordList passed from TranslationWordScraper
 * @param {function} callback -
 *
 *
 *
 *
 */

function NewParser(wordList = "", callback = () => {}) {
  let mainReg = new RegExp("=+\\s*ulb:?\\s*=+\\s*<usfm>([^<]+)<\\/usfm>", "i");
  let result = undefined;
  try {
    [,result] = mainReg.exec(wordList);
}
catch (e) {
  console.log("No ULB text found in file. Either incorrect input or file is not formatted correctly");
}

function parseFile(text) {

}

module.exports = NewParser;
