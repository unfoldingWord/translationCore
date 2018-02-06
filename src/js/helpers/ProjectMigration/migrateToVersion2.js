import path from 'path';
import * as fs from 'fs-extra';
import * as Version from './VersionUtils';
import XRegExp from 'xregexp';
// constants
export const word = XRegExp('[\\pL\\pM]+', '');
export const punctuation = XRegExp('(^\\p{P}|[<>]{2})', '');
export const whitespace = /\s+/;
const tokenizerOptions = {word, whitespace, punctuation};

export const MIGRATE_MANIFEST_VERSION = 2;

/**
 * @description
 * function that conditionally runs the migration if needed
 * @param {String} projectPath - path to project
 * @param {string} projectLink - Link to the projects git repo if provided i.e. https://git.door43.org/royalsix/fwe_tit_text_reg.git
 */
export default (projectPath, projectLink) => {
  Version.getVersionFromManifest(projectPath, projectLink); // ensure manifest converted for tc
  if (shouldRun(projectPath)) run(projectPath);
};

/**
 * @description function that checks to see if the migration should be run
 * @param {String} projectPath - path to project
 * @return {boolean} true if version number needs to be updated
 */
const shouldRun = (projectPath) => {
  const version = Version.getVersionFromManifest(projectPath);
  return (version < MIGRATE_MANIFEST_VERSION);
};


/**
 * @description - update manifest version to this version
 * @param {String} projectPath - path to project
 * @return {null}
 */
const run = (projectPath) => {
  updateAlignments(projectPath);
  Version.setVersionInManifest(projectPath, MIGRATE_MANIFEST_VERSION);
};

const updateAlignments = function (projectPath) {
  const projectAlignmentDataPath = path.join(projectPath, '.apps', 'translationCore', 'alignmentData');
  if (fs.existsSync(projectAlignmentDataPath)) {
    const alignmentFolders = fs.readdirSync(projectAlignmentDataPath);
    for (let folder of alignmentFolders) {
      const alignmentPath = path.join(projectAlignmentDataPath, folder);
      const files = fs.readdirSync(alignmentPath).filter((file) => (path.extname(file) === '.json'));
      for (let file of files) {
        const file_path = path.join(alignmentPath, file);
        let modified = false;
        try {
          const chapter_alignments = fs.readJsonSync(file_path);
          // let chapterVerseData;
          // const chapterVerseFile = path.join(projectPath, folder, file);
          // try {
          //   chapterVerseData = fs.readJsonSync(chapterVerseFile);
          // } catch(e) {
          //   console.warn("Error opening chapter verse data '" + chapterVerseFile + "': " + e.toString());
          // }
          for (let verse of Object.keys(chapter_alignments)) {
            const alignmentWords = {};
            for (let alignment of chapter_alignments[verse].alignments) {
              modified = convertStrongstoStrong(alignment, modified);

              // populate map of alignment words
              for (let wordItem of alignment.bottomWords) {
                const { word, occurrence } = wordItem;
                if (!alignmentWords[word]) alignmentWords[word] = {};
                alignmentWords[word][occurrence] = wordItem;
              }
            }
            // if (chapterVerseData) {
            //   if (chapterVerseData[verse]) {
            //     const verseData = chapterVerseData[verse];
            //     const verseString = mergeVerseData(verseData);

            for (let wordItem of chapter_alignments[verse].wordBank) {
              const { word, occurrence } = wordItem;
              if (!alignmentWords[word]) alignmentWords[word] = {};
              alignmentWords[word][occurrence] = wordItem;
            }

            let modifiedOccurence = false;
            for (let word of Object.keys(alignmentWords)) {
              const wordData = alignmentWords[word];
              const occurrenceList = Object.keys(wordData).sort((a, b) => (parseInt(a) - parseInt(b)));
              const actualOccurrences = occurrenceList.length;
              for (let i = 0; i < actualOccurrences; i++) {
                const itemOccurrence = occurrenceList[i];
                const wordItem = wordData[itemOccurrence];
                if (parseInt(itemOccurrence) !== i + 1) { // if occurrence is off
                  wordItem.occurrence = i + 1;
                  modifiedOccurence = true;
                }
                if (wordItem.occurrences !== actualOccurrences) { // if occurrence is off
                  wordItem.occurrences = actualOccurrences;
                  modifiedOccurence = true;
                }
              }
            }

            if (modifiedOccurence) {
              console.log("updated occurence(s) in verse " + verse + " of '" + file + "'");
              modified = true;
            }

              // } else {
              //   console.warn("Error missing text for verse " + verse + " in '" + file + "'");
              // }
          //   }
          }
          if (modified) {
            fs.outputJsonSync(file_path, chapter_alignments);
          }
        } catch(e) {
          console.warn("Error opening chapter alignment '" + file_path + "': " + e.toString());
        }
      }
    }
  }
};

const convertStrongstoStrong = function (alignment, modified) {
  for (let word of alignment.topWords) {
    if (word.strongs) {
      word.strong = word.strongs;
      delete word.strongs;
      modified = true;
    }
  }
  return modified;
};

/////////////////////////////////////////////////////////////////////////////
// version 1 methods - from WordAlignmentHelpers.js
/////////////////////////////////////////////////////////////////////////////

/**
 * gets the occurrence of a subString in a string by using the subString index in the string.
 * @param {String} string
 * @param {Number} currentWordIndex
 * @param {String} subString
 * Cannot replace with tokenizer until tokenizer handles all greek use cases that broke tokenizer
 */
const V1_getOccurrenceInString = (string, currentWordIndex, subString) => {
  let arrayOfStrings = string.split(' ');
  let occurrence = 1;
  let slicedStrings = arrayOfStrings.slice(0, currentWordIndex);

  slicedStrings.forEach((slicedString) => {
    if (slicedStrings.includes(subString)) {
      slicedString === subString ? occurrence += 1 : null;
    } else {
      occurrence = 1;
    }
  });
  return occurrence;
};

/**
 * @description Function that count occurrences of a substring in a string
 * @param {String} string - The string to search in
 * @param {String} subString - The sub string to search for
 * @returns {Integer} - the count of the occurrences
 * @see http://stackoverflow.com/questions/4009756/how-to-count-string-occurrence-in-string/7924240#7924240
 * modified to fit our use cases, return zero for '' substring, and no use case for overlapping.
 */
const V1_occurrencesInString = (string, subString) => {
  if (subString.length <= 0) return 0;
  let occurrences = 0, position = 0, step = subString.length;
  while (position < string.length) {
    position = string.indexOf(subString, position);
    if (position === -1) break;
    ++occurrences;
    position += step;
  }
  return occurrences;
};

/**
 * @description merge verse data into a string
 * @param {Object|Array|String} verseData
 * @return {String}
 */
export const mergeVerseData = (verseData) => {
  if (verseData.verseObjects) {
    verseData = verseData.verseObjects;
  }
  if (typeof verseData === 'string') {
    return verseData;
  }
  const verseArray = verseData.map((verse) => {
    if (typeof verse === 'string') {
      return verse;
    }
    if (verse.text) {
      return verse.text;
    }
    return null;
  });
  let verseText = '';
  for (let verse of verseArray) {
    if (verse) {
      if (verseText && (verseText[verseText.length - 1] !== '\n')) {
        verseText += ' ';
      }
      verseText += verse;
    }
  }
  return verseText;
};

/////////////////////////////////////////////////////////////////////////////
// version 2 methods from stringHelpers.js
/////////////////////////////////////////////////////////////////////////////

/**
 * @Description - tokenize a string into an array of words
 * @Param {String} string - string to be tokenized
 * @Return {Array} - array of tokenized words/strings
 * TODO: move this to an external npm package to consume with other helpers
 */
export const tokenize = (string) => {
  const _tokens = classifyTokens(string, tokenizerOptions);
  const tokens = _tokens.filter(token => token.type === 'word')
    .map(token => token.token);
  return tokens;
};
/**
 * @Description - tokenize a string into an array of words
 * @Param {String} string - string to be tokenized
 * @Return {Array} - array of tokenized words/strings
 * TODO: move this to an external npm package to consume with other helpers
 */
export const tokenizeWithPunctuation = (string) => {
  const _tokens = classifyTokens(string, tokenizerOptions);
  const tokens = _tokens.filter(token => token.type === 'word' || token.type === 'punctuation')
    .map(token => token.token);
  return tokens;
};

/**
 * gets the occurrence of a subString in a string by using the subString index in the string.
 * @param {String} string
 * @param {Number} currentWordIndex
 * @param {String} subString
 */
const V2_occurrenceInString = (string, currentWordIndex, subString) => {
  let occurrence = 0;
  const tokens = tokenize(string);
  tokens.forEach((token, index) => {
    if (token === subString && index <= currentWordIndex) occurrence ++;
  });
  return occurrence;
};

/**
 * @description Function that count occurrences of a substring in a string
 * @param {String} string - The string to search in
 * @param {String} subString - The sub string to search for
 * @returns {Integer} - the count of the occurrences
 */
const V2_occurrencesInString = (string, subString) => {
  let occurrences = 0;
  const tokens = tokenize(string);
  tokens.forEach(token => {
    if (token === subString) occurrences ++;
  });
  return occurrences;
};

/**
 * @Description - Tiny tokenizer - https://gist.github.com/borgar/451393
 * @Param {String} string - string to be tokenized
 * @Param {Object} parsers - { word:/\w+/, whitespace:/\s+/, punctuation:/[^\w\s]/ }
 * @Param {String} deftok - type to label tokens that are not classified with the above parsers
 * @Return {Array} - array of objects => [{ token:"this", type:"word" },{ token:" ", type:"whitespace" }, Object { token:"is", type:"word" }, ... ]
 **/
const classifyTokens = (string, parsers, deftok) => {
  string = (!string) ? '' : string; // if string is undefined, make it an empty string
  if (typeof string !== 'string')
    throw 'tokenizer.tokenize() string is not String: ' + string;
  let m, r, t, tokens = [];
  while (string) {
    t = null;
    m = string.length;
    for ( let key in parsers ) {
      r = parsers[ key ].exec( string );
      // try to choose the best match if there are several
      // where "best" is the closest to the current starting point
      if ( r && ( r.index < m ) ) {
        t = {
          token: r[ 0 ],
          type: key,
          matches: r.slice( 1 )
        };
        m = r.index;
      }
    }
    if ( m ) {
      // there is text between last token and currently
      // matched token - push that out as default or "unknown"
      tokens.push({
        token : string.substr( 0, m ),
        type  : deftok || 'unknown'
      });
    }
    if ( t ) {
      // push current token onto sequence
      tokens.push( t );
    }
    string = string.substr( m + (t ? t.token.length : 0) );
  }
  return tokens;
};
