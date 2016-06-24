// takes in usfm file as string

function usfmToJSON(usfm) {
  let chapters = usfm.split("\\c ");
  let config = chapters[0];
  let reg = /\\h ([^\\]+)/;
  reg = reg.exec(config);
  let name = reg[1];
  chapters.shift();
  console.log(name);

  let chap_data = {};
  // loop through all chapters
  for (var ch in chapters) {
    // make this chapter an object
    chap_data[ch] = [];
    let verses = chapters[ch].split("\\v ");
    chap_data[0] = parseInt(/^ *([0-9]+) */.exec(verses[0]));
    // process prequel if needed
    verses.shift();
    verses = verses.map((v) => {
      return v.replace(/^ *[0-9]+ */, "");
    });
    return verses;
  }
}
module.exports = usfmToJSON;
