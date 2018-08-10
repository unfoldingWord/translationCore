import fs from 'fs-extra';
import path from 'path-extra';
import ospath from 'ospath';
import * as bibleData from '../bibleData';
// helpers
import * as ResourcesHelpers from '../ResourcesHelpers';

/**
 * @description - generates the tW files in resources/{lang}/translationHelps/translationWords/{version} from resources/{lang}/bibles/{resource}/{version}
 * @param {string} lang
 * @param {string} bible
 * @returns {string} Path where tW was generated
 */
export const generateTwGroupDataFromAlignedBible = (lang, bible) => {
  const biblePath = path.join(ospath.home(), 'translationCore/resources', lang, 'bibles', bible);
  if (! fs.pathExistsSync(biblePath)) {
    return null;
  }
  const bibleVersionPath = ResourcesHelpers.getLatestVersionInPath(biblePath);
  const version = path.basename(bibleVersionPath);
  const twOutputPath = path.join(ospath.home(), 'translationCore/resources', lang, 'translationHelps/translationWords', version);
  let books = bibleData.BIBLE_LIST_NT.slice(0);
  books.forEach( (bookName) => {
    convertBookVerseObjectsToTwData(bibleVersionPath, twOutputPath, bookName);
  });
  return twOutputPath;
};

/**
 * @description - gets verseObjects of a book and converts to a tW data object to save to file
 * @param {string} biblePath - Usually path to the UGNT
 * @param {string} twPath - The output path for tW files
 * @param {string} bookName - Book in format, e.g. '41-MAT'
 */
function convertBookVerseObjectsToTwData(biblePath, twPath, bookName) {
  const bookId = getbookId(bookName);
  let twData = {};
  const bookDir = path.join(biblePath, bookId);
  if (fs.existsSync(bookDir)) {
    const chapters = Object.keys(bibleData.BOOK_CHAPTER_VERSES[bookId]).length;
    for(let chapter = 1; chapter <= chapters; chapter++) {
      const chapterFile = path.join(bookDir, chapter+'.json');
      if (fs.existsSync(chapterFile)) {
        const json = JSON.parse(fs.readFileSync(chapterFile));
        for (let verse in json) {
          let groupData = [];
          json[verse].verseObjects.forEach( (verseObject) => {
            populateGroupDataFromVerseObject(groupData, verseObject);
          });
          populateTwDataFromGroupData(twData, groupData, bookId, chapter, verse);
        }
      }
    }
    for(let category in twData){
      for(let groupId in twData[category]){
        let groupPath = path.join(twPath, category, "groups", bookId, groupId+".json");
        fs.outputFileSync(groupPath, JSON.stringify(twData[category][groupId], null, 2));
      }
    }
  }
}

/**
 * @description Populates the groupData array with this verseObject and returns its own groupData for milestones
 * @param {object} groupData
 * @param {object} verseObject
 * @param {bool} isMilestone - if true, all word objects will be added to the group data
 * @return {object}
 */
function populateGroupDataFromVerseObject(groupData, verseObject, isMilestone=false) {
  var myGroupData = {
    quote: [],
    strong: []
  };
  if(verseObject.type == 'milestone' || (verseObject.type == 'word' && (verseObject.tw || isMilestone))) {
    if(verseObject.type == 'milestone') {
      if(verseObject.text) {
        myGroupData.text.push(verseObject.text);
      }
      verseObject.children.forEach((childVerseObject) => {
        let childGroupData = populateGroupDataFromVerseObject(groupData, childVerseObject, true);
        if(childGroupData) {
          myGroupData.quote = myGroupData.quote.concat(childGroupData.quote);
          myGroupData.strong = myGroupData.strong.concat(childGroupData.strong);
        }
      });
    } else if(verseObject.type == 'word') {
      myGroupData.quote.push(verseObject.text);
      myGroupData.strong.push(verseObject.strong);
    }
    if (myGroupData.quote.length) {
      if(verseObject.tw) {
        const twLinkItems = verseObject.tw.split('/');
        const groupId = twLinkItems.pop();
        const category = twLinkItems.pop();
        if(! groupData[category]) {
          groupData[category] = {};
        }
        if(! groupData[category][groupId]) {
          groupData[category][groupId] = [];
        }
        groupData[category][groupId].push({
          quote: myGroupData.quote.join(' '),
          strong: myGroupData.strong
        });
      }
    }
  }
  return myGroupData;
}

/**
 * @description Takes what is in the groupData array and populates the tWData
 * @param {object} twData
 * @param {object} groupData
 * @param {string} bookId
 * @param {int} chatper
 * @param {int} verse
 */
function populateTwDataFromGroupData(twData, groupData, bookId, chapter, verse) {
  for(let category in groupData) {
    if( ! twData[category] ) {
      twData[category] = [];
    }
    for(let groupId in groupData[category]) {
      if( ! twData[category][groupId] ) {
        twData[category][groupId] = [];
      }
      let occurrences = {};
      groupData[category][groupId].forEach( (item) => {
        if(! occurrences[item.quote]) {
          occurrences[item.quote] = 1;
        }
        twData[category][groupId].push({
          "priority": 1,
          "comments": false,
          "reminders": false,
          "selections": false,
          "verseEdits": false,
          "contextId": {
            "reference": {"bookId": bookId, "chapter": chapter, "verse": parseInt(verse)},
            "tool": "translationWords",
            "groupId": groupId,
            "quote": item.quote,
            "strong": item.strong,
            "occurrence": occurrences[item.quote]++
          }
        });
      });
    }
  }
}

/**
 * @description - split book code out of book name, for example 'mat' from '41-MAT'
 * @param {string} bookName - book in format '41-MAT'
 * @return {string}
 */
function getbookId(bookName) {
  return bookName.split('-')[1].toLowerCase();
}
