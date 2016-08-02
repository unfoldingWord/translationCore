/**
 * @author Evan Wiederspan
 * @description takes in usfm file as string
 * @param {string} usfm - A string in the USFM format
 * @return {string} A string that is the parsed version of the USFM input.
*******************************************************************************/


function usfmToJSON(usfm_in) {
  var usfm = usfm_in.replace(/\\[abd-uw-z][\w\*]*\s?|\+\s/gi, "");

  const chapterNumberExpression = /^\s*(\d+)\s+/;
  const verseNumberExpression = /^\s*(\d+)\s+/;

  let bookData = {bookAbbr: "???", chapters: []};
  let chapters = usfm.split("\\c ");
  for (let ch in chapters) {
    if (/ [A-Za-z]+ /.test(chapters[ch]) == false) continue;
    if (/\\h /.test(chapters[ch])) {
      bookData.header = chapters[ch];
    }
    else {
      let chapNum;
      let newChap = {verses: []};
      var chapNumReg = chapterNumberExpression;

      try {
        [,chapNum] = chapNumReg.exec(chapters[ch]);
      }
      catch (e) {
        chapNum = "-1";
      }

      newChap.num = parseInt(chapNum);
      // get rid of chapter number
      chapters[ch].replace(chapNumReg, "");
      let verses = chapters[ch].split("\\v ");
      for (let v in verses) {
        if (/ [A-Za-z]+ /.test(verses[v]) == false) continue;
        let newVerse = {};
        let verseNumReg = verseNumberExpression;
        let verseNum;

        // this should work the majority of the time
        try {
          [, verseNum] = verseNumReg.exec(verses[v]);
        }
        catch (e) {
          verseNum = "-1";
        }
        newVerse.num = parseInt(verseNum);
        verses[v] = verses[v].replace(/^\s*\d+\s+/, "");
        newVerse.text = verses[v];
        newChap.verses.push(newVerse);
      }
      if (newChap.verses.length != 0)
        bookData.chapters.push(newChap);
    }
  }
  return bookData;
}

module.exports = usfmToJSON;