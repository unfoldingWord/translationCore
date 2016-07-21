/**
 * @author Evan "He Who Catches Them All" Wiederspan
 * @description takes in usfm file as string
 * @param {string} usfm - A string in the USFM format
 * @return {string} A string that is the parsed version of the USFM input.
*******************************************************************************/
function usfmToJSON(usfm) {
  let chapData = {};
  let chapters = usfm.split("\\c ");
  for (let ch in chapters) {
    if (chapters[ch] === "") continue;
    if (/\\h /.exec(chapters[ch])) {
      chapData.header = chapters[ch];
    } else {
      let chapNum = "verses";
      chapData[chapNum] = {};
      let verses = chapters[ch].split("\\v ");
      for (let v in verses) {
        if (verses[v] === "") continue;
        let verseNum;
        try { // this shoudl work the majority of the time
          [, verseNum] = /^(\d+)/.exec(verses[v]);
        } catch (e) {
          verseNum = "-1";
        }
        verseNum = parseInt(verseNum);
        chapData[chapNum][verseNum] = verses[v].replace(/^\s*(\d+)\s*/, "");
      }
    }
  }
  return chapData;
}
module.exports = usfmToJSON;
