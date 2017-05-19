import fs from 'fs-extra';
import path from 'path-extra';

/**
 * @description edits a verse for a door43 project in the file system.
 * @param {object} state - store state.
 * @param {string} editedText - new edited version of the verse.
 */
export function editTargetVerseSource(state, editedText) {
  let {contextIdReducer, projectDetailsReducer} = state;
  let saveLocation = projectDetailsReducer.projectSaveLocation;
  let chapter = contextIdReducer.contextId.reference.chapter;
  let verse = contextIdReducer.contextId.reference.verse;
  if (chapter < 10) {
    chapter = "0" + chapter;
  }
  let writeFolder = path.join(saveLocation, chapter);
  let contents = fs.readdirSync(writeFolder).filter(file => {
    return file !== "title.txt";
  });
  let writeFile = null;
  for (let i = 0; i < contents.length; i++) {
    let chunk = contents[i];
    let numChunk = parseInt(chunk.split('.txt')[0], 10);
    if (numChunk <= verse && (contents[i + 1] === undefined || parseInt(contents[i + 1].split('.txt')[0], 10) > verse)) {
      writeFile = path.join(writeFolder, chunk);
      break;
    }
  }
  let fileContents = fs.readFileSync(writeFile).toString();
  let tokenizedFile = fileContents.split('\\v');
  for (let i = 0; i < tokenizedFile.length; i++) {
    let item = tokenizedFile[i];
    let trimmedItem = item.trim();
    let currentVerse = parseInt(trimmedItem.split(' ')[0], 10);
    if (currentVerse === verse) {
      tokenizedFile[i] = " " + verse + " " + editedText + " ";
      break;
    }
  }
  let saveFile = tokenizedFile.join('\\v');
  fs.writeFileSync(writeFile, saveFile);
}
