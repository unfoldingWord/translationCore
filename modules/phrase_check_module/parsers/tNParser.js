/**
 * @author Evan "He of the Squeaky Chair" Wiederspan
 * @param book A book object retrived from the getBook call from
 * the HTMLParser
 * @param progCallback a function with a single parameter that is
 * called in order to tie the function to a progress bookAbbr
 * its parameter will be a decimal number between 0 and 1 representing
 * the percentage of the way through the function
 * @return The book data
*/

var suppress = true;
var TNParser = function(book, bookAbbr, progCallback = () => {}) {
    
    book = book.chapters;
    let numChapters = Object.keys(book).length;
    let i = 1;
    progCallback(0);
    let bookData = {}; // return value
    for (let chap in book) {
      for (let verse in book[chap].verses) {
        if (verse == "00.txt") continue;
        let tnReg = new RegExp("=+\\s*translationnotes:?\\s*=+([^=]+)", "i");
        let verseText;
        try {
          [,verseText] = tnReg.exec(book[chap].verses[verse].file);
        } catch(e) {
          if (!suppress) {
            console.warn("TN Parse Warning: No TN Data for chapter " + chap.num + " verse " + verse.num);
            console.warn("File may be in incorrect format");
          }
          continue;
        }
        let pieces = [];
        let pieceReg = new RegExp("\\*\\*([^*]+)\\*\\*\\s*-\\s*([^*]*)", "g");
        let temp;
        while(temp = pieceReg.exec(verseText)) {
          pieces.push({origText: temp[1], tNote: temp[2]});
        }
        pieces.map((piece) => {
          let linkReg = new RegExp("\\[\\[:?\\w+:\\w+:(\\w+):\\w+:(\\w+)\\]\\]", "g");
          let linkRes = linkReg.exec(piece.tNote);
          if (linkRes != null) {
            let [,volNum,partOfSpeech] = linkRes;
            if (bookData[partOfSpeech] === undefined) bookData[partOfSpeech] = {tnLink: linkBuilder(volNum, partOfSpeech), verses: []};
            let verseReg = new RegExp("^[0-9]+");
            let [verseNum] = verseReg.exec(verse);
            bookData[partOfSpeech].verses.push({
              book: bookAbbr,
              chapter: parseInt(chap),
              verse: parseInt(verse),
              phrase: piece.origText,
              phraseInfo: piece.tNote
            });
          }
        });
      }
      progCallback(i++ / numChapters);
    }
    return bookData;
}
// builds the link to the translationNotes markdown file
// change this in the future if the link format changes
var linkBuilder = function(vol, type) {
  return `https://git.door43.org/Door43/en-ta-translate-${vol}/src/master/content/${type}.md`;
}

module.exports = TNParser;
