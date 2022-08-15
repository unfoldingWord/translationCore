/* eslint-disable no-console */
import fs from 'fs-extra';
import usfm from 'usfm-js';
// helpers
import * as bibleHelpers from './bibleHelpers';

/**
 * @description Sets up the folder in the tC save location for a USFM project
 * @param {String} usfmFilePath - Path of the usfm file that has been loaded
 */
export function loadUSFMFile(usfmFilePath) {
  let usfmFile;

  try {
    usfmFile = fs.readFileSync(usfmFilePath).toString();
  } catch (e) {
    return null;
  }
  return usfmFile;
}

/**
 * @description Sets up the folder in the tC save location for a USFM project
 * @param {String} usfmFilePath - Path of the usfm file that has been loaded
 */
export async function loadUSFMFileAsync(usfmFilePath) {
  let usfmFile;

  try {
    usfmFile = await fs.readFile(usfmFilePath);
  } catch (e) {
    return null;
  }
  return usfmFile.toString();
}

/**
 * @description Parses the usfm file using usfm-parse library.
 * @param {string} usfmData - USFM data to parse
 */
export function getParsedUSFM(usfmData) {
  try {
    if (usfmData) {
      return usfm.toJSON(usfmData, { convertToInt: ['occurrence', 'occurrences'] });
    }
  } catch (e) {
    console.error(e);
  }
}

/**
 * @description get tag item from headers array
 * @param headers
 * @param tag
 * @return {String} content of tag if found, else null
 */
export function getHeaderTag(headers, tag) {
  if (headers) {
    const retVal = headers.find(header => header.tag === tag);

    if (retVal) {
      return retVal.content;
    }
  }
  return null;
}

/**
 * parses only the header information of a valid usfm file.  Header information is the part before the first chapter marker.
 * @param {String} usfmData - USFM data to parse
 * @return {*}
 */
export function getUsfmHeaderInfo(usfmData) {
  const pos = usfmData.indexOf('\\c ');
  const header = (pos >= 0) ? usfmData.substr(0, pos) : usfmData; // if chapter marker is found, process only that part
  return getParsedUSFM(header);
}

/**
 * parse USFM header details from usfm data
 * @param {String} usfmData - USFM data to parse
 * @return {*}
 */
export function parseUsfmDetails(usfmData) {
  const usfmObject = getUsfmHeaderInfo(usfmData);
  return getUSFMDetails(usfmObject);
}

/**
* Most important function for creating a project from a USFM file alone. This function gets the
* book name, id, language name and direction for starting a tC project.
* @param {object} usfmObject - Object created by USFM to JSON module. Contains information
* for parsing and using in tC such as book name.
*/
export function getUSFMDetails(usfmObject) {
  let details = {
    book: {
      id: undefined,
      name: undefined,
    },
    language: {
      id: undefined,
      name: undefined,
      direction: 'ltr',
    },
    target_languge: { book: { name: undefined } },
  };

  // adding target language book name from usfm headers
  const targetLangugeBookName = getHeaderTag(usfmObject.headers, 'h');
  details.target_languge.book.name = targetLangugeBookName;

  let headerIDArray = [];
  const tag = 'id';
  const id = getHeaderTag(usfmObject.headers, tag);

  if (id) {
    // Conditional to determine how USFM should be parsed.
    let isSpaceDelimited = id.split(' ').length > 1;
    let isCommaDelimited = id.split(',').length > 1;

    if (isSpaceDelimited) {
      // i.e. TIT EN_ULB sw_Kiswahili_ltr Wed Jul 26 2017 22:14:55 GMT-0700 (PDT) tc.
      // Could have attached commas if both comma delimited and space delimited
      headerIDArray = id.split(' ');
      headerIDArray.forEach((element, index) => {
        headerIDArray[index] = element.replace(',', '');
      });
      details.book.id = headerIDArray[0].trim().toLowerCase();
    } else if (isCommaDelimited) {
      // i.e. TIT, sw_Kiswahili_ltr, EN_ULB, Thu Jul 20 2017 16:03:48 GMT-0700 (PDT), tc.
      headerIDArray = id.split(',');
      details.book.id = headerIDArray[0].trim().toLowerCase();
    } else {
      // i.e. EPH
      details.book.id = id.toLowerCase();
    }

    let fullBookName = bibleHelpers.convertToFullBookName(details.book.id);

    if (fullBookName) {
      details.book.name = fullBookName;
    } else {
      fullBookName = bibleHelpers.convertToFullBookName(usfmObject.book);

      if (fullBookName) {
        details.book.name = fullBookName;
      } else {
        details.book.id = null;
      }
    }

    let tcField = headerIDArray[headerIDArray.length - 1] || '';

    if (tcField.trim() === 'tc') {
      details.repo = headerIDArray[1];

      // Checking for tC field to parse with more information than standard usfm.
      for (let index in headerIDArray) {
        let languageCodeArray = headerIDArray[index].trim().split('_');

        if (languageCodeArray.length === 3) {
          details.language.id = languageCodeArray[0].toLowerCase();
          details.language.name = languageCodeArray[1].split('⋅').join(' '); // restore spaces
          details.language.direction = languageCodeArray[2].toLowerCase();
        }
      }
    }
  }
  return details;
}
