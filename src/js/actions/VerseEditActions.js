import consts from '../actions/CoreActionConsts';
import {generateTimestamp} from '../helpers/index';
import fs from 'fs-extra';
import path from 'path-extra';

/**
 * @description This action updates or adds the data needed to
 * @param {string} before - Previous text version of the verse.
 * @param {string} after - New edited text version  of the verse.
 * @param {array} tags - Array of tags used for verse Edit check boxes.
 * @param {string} userName - Alias name.
 * @return {object} New state for verse Edit reducer.
 */
export const addVerseEdit = (before, after, tags, userName, context, saveLocation) => {
  let chapter = context.reference.chapter; 
  let verse = context.reference.verse;
  if (chapter < 10){
    chapter = "0" + chapter;
  }
  let writeFolder = path.join(saveLocation, chapter);
  let contents = fs.readdirSync(writeFolder);
  let writeFile = null;
  for (let i = 0; i < contents.length; i++) {
    let chunk = contents[i];
    let numChunk = parseInt(chunk.split('.txt')[0]);
    if ((numChunk <= verse && contents[i+1] === undefined) || (numChunk <= verse && parseInt(contents[i+1].split('.txt')[0]) > verse)) {
      writeFile = path.join(writeFolder, chunk);
      break;
    }
  }
  let fileContents = fs.readFileSync(writeFile).toString();
  let tokenizedFile = fileContents.split('\\v');
  for (let i = 0; i < tokenizedFile.length; i++) {
    let item = tokenizedFile[i];
    if (parseInt(item.trim()[0]) === verse) {
      tokenizedFile[i] = " " + verse + " " + after + " ";
      break;
    }
  }
  let saveFile = tokenizedFile.join('\\v');
  fs.writeFileSync(writeFile, saveFile);
  return {
    type: consts.ADD_VERSE_EDIT,
    before,
    after,
    tags,
    userName,
    context,
    saveLocation: writeFile,
    modifiedTimestamp: generateTimestamp()
  };
};
