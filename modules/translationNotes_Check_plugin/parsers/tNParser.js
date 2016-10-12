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
  // using target language to find which verses the checks are in
    let lang = window.ModuleApi.getDataFromCommon("gatewayLanguage");
    if (!lang) {
      console.error("No gateway language for TN parser");
      return {};
    }
    book = book.chapters;
    let numChapters = Object.keys(book).length;
    let i = 1;
    progCallback(0);
    // bookData will be an object where each key is a different part of speech
    // each key will have an array called "verses" that contains all of the checks
    // tied to that part of speech
    let bookData = {};
    let tnReg = /=+\s*translationnotes:?\s*=+([^=]+)/i;
    let verseStartReg = /:(\d)+/;
    for (let chap in book) {
      let chapNum = parseInt(book[chap].num);
      for (let verse in book[chap].verses) {
        if (verse == "0") continue;
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
        let linkReg = new RegExp("\\[\\[:?\\w+:\\w+:(\\w+):\\w+:(\\w+)\\]\\]", "g");
        pieces.forEach((piece) => {
          // pull the volume and part of speech out of the link
          let linkRes = linkReg.exec(piece.tNote);
          if (linkRes != null) {
            let [,volNum,partOfSpeech] = linkRes;
            // find verse
            let quotePieces = piece.origText.split(" ... ");
            let verseStart, verseEnd, startPos, searchVerse;
            try {
              searchVerse = parseInt(verseStartReg.exec(book[chap].verses[verse].file)[1]);
              let searchChapTry = lang[chapNum][searchVerse];

            }
            catch (e){
              return;
            }
            for (let searchChap = lang[chapNum]; searchChap[searchVerse] != undefined; searchVerse++) {
              if ((startPos = searchChap[searchVerse].indexOf(quotePieces[0])) != -1) {
                verseStart = searchVerse;
                break;
              }
            }
            if (quotePieces.length > 1) {
              // search through again, looking for the last piece so we know the verse range
              for (let searchChap = lang[chapNum]; searchChap[searchVerse] != undefined; searchVerse++) {
                if (searchChap[searchVerse].indexOf(quotePieces[quotePieces.length - 1], startPos) != -1) {
                  verseEnd = searchVerse;
                  break;
                } 
              }
            }
            if (verseStart != 0 && !verseStart) {
              return;
            }
            let newVerse = {
              book: bookAbbr,
              chapter: chapNum,
              verse: verseStart,
              phrase: piece.origText,
              phraseInfo: piece.tNote
            };
            if (verseEnd !== undefined && verseEnd != verseStart) {
              newVerse.verseEnd = verseEnd;
            }
            if (bookData[partOfSpeech] === undefined) {
              bookData[partOfSpeech] = {tnLink: linkBuilder(volNum, partOfSpeech), verses: []};
            }
            bookData[partOfSpeech].verses.push(newVerse);
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
