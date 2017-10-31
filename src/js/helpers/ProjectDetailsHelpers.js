// modules
import fs from 'fs-extra';
import path from 'path-extra';
import * as MissingVersesHelpers from './MissingVersesHelpers';

export function getToolProgress(pathToCheckDataFiles) {
  let progress = 0;
  if (fs.existsSync(pathToCheckDataFiles)) {
    let groupDataFiles = fs.readdirSync(pathToCheckDataFiles).filter(file => { // filter out .DS_Store
      return file !== '.DS_Store' && path.extname(file) === '.json';
    });
    let allGroupDataObjects = {};
    groupDataFiles.map((groupDataFileName) => {
      const groupData = fs.readJsonSync(path.join(pathToCheckDataFiles, groupDataFileName));
      allGroupDataObjects[groupDataFileName.replace('.json', '')] = groupData;
    });
    progress = calculateProgress(allGroupDataObjects);
  }
  return progress;
}

/**
  * @description generates the progress percentage
  * @param {object} groupsData - all of the data to calculate percentage from
  * @return {double} - percentage number returned
  */
function calculateProgress(groupsData) {
  let percent;
  const groupIds = Object.keys(groupsData);
  let totalChecks = 0, completedChecks = 0;
  // Loop through all checks and tally completed and totals
  groupIds.forEach(groupId => {
    const groupData = groupsData[groupId];
    groupData.forEach(check => {
      totalChecks += 1;
      // checks are considered completed if selections
      completedChecks += (check.selections) ? 1 : 0;
    });
  });
  // calculate percentage by dividing total by completed
  percent = Math.round(completedChecks / totalChecks * 100) / 100;
  return percent;
}

export function getWordAlignmentProgress(pathToWordAlignmentData, bookId) {
  let groupsObject = {};
  let checked = 0;
  let totalChecks = 0;
  let expectedVerses = MissingVersesHelpers.getExpectedBookVerses(bookId, 'grc', 'bhp', 'v0');
  if (fs.existsSync(pathToWordAlignmentData)) {
    let groupDataFiles = fs.readdirSync(pathToWordAlignmentData).filter(file => { // filter out .DS_Store
      return path.extname(file) === '.json';
    });
    groupDataFiles.forEach((chapterFileName) => {
      groupsObject[path.parse(chapterFileName).name] = fs.readJsonSync(path.join(pathToWordAlignmentData, chapterFileName));
    });
    for (var chapterNumber in groupsObject) {
      for (var verseNumber in groupsObject[chapterNumber]) {
        let wordAlignments = groupsObject[chapterNumber][verseNumber].alignments;
        for (var alignment of wordAlignments) {
          if (alignment.bottomWords.length > 0) checked++;
        }
      }
    }
    totalChecks = Object.keys(expectedVerses).reduce((chapterTotal, chapterNumber) => {
      return Object.keys(expectedVerses[chapterNumber]).reduce((alignmentTotal, i) => {
        return expectedVerses[chapterNumber][i] + alignmentTotal;
      }, 0) + chapterTotal;
    }, 0);
  }
  if (!totalChecks) return 0;
  else return checked / totalChecks;
} 
