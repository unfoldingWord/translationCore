import fs from "fs-extra";
import path from "path-extra";
import { getLatestVersionInPath } from "./ResourcesHelpers";
import { getTranslation } from "./localizationHelpers";

export const STATIC_RESOURCES_PATH = path.join(__dirname,
  "../../../tcResources");

// TODO: groupsIndexHelpers.js should be combined with this file or vice versa.

/**
 * TODO: should this use the user's resources in the home dir instead of the static resources?
 * @description - Auto generate the chapter group data since more projects will use it
 * @param {String} bookId - id of the current book
 * @param {String} toolName - id of the current tool
 */
export const generateChapterGroupData = (bookId, toolName) => {
  let groupsData = [];
  let ultPath = path.join(STATIC_RESOURCES_PATH, "en", "bibles", "ult");
  let versionPath = getLatestVersionInPath(ultPath) || ultPath;
  const ultIndexPath = path.join(versionPath, "index.json");
  if (fs.existsSync(ultIndexPath)) { // make sure it doens't crash if the path doesn't exist
    const ultIndex = fs.readJsonSync(ultIndexPath); // the index of book/chapter/verses
    const bookData = ultIndex[bookId]; // get the data in the index for the current book
    groupsData = Array(bookData.chapters).fill().map((_, i) => { // create array from number of chapters
      const chapter = i + 1; // index is 0 based, so add one for chapter number
      const verses = bookData[chapter]; // get the number of verses in the chapter
      return Array(verses).fill().map((_, i) => { // turn number of verses into array
        const verse = i + 1; // index is 0 based, so add one for verse number
        return {
          "contextId": {
            "reference": {
              "bookId": bookId,
              "chapter": chapter,
              "verse": verse
            },
            "tool": toolName,
            "groupId": "chapter_" + chapter
          }
        };
      });
    });
  }
  return groupsData;
};

/**
 * Generates a chapter-based group index.
 * Most tools will use a chapter based-index.
 * TODO: do not localize the group name here. Instead localize it as needed. See todo on {@link loadProjectGroupIndex}
 * @param {function} translate - the locale function
 * @param {number} [numChapters=150] - the number of chapters to generate
 * @return {*}
 */
export const generateChapterGroupIndex = (translate, numChapters = 150) => {
  const chapterLocalized = getTranslation(translate, "tools.chapter",
    "Chapter");
  return Array(numChapters).fill().map((_, i) => {
    let chapter = i + 1;
    return {
      id: "chapter_" + chapter,
      name: chapterLocalized + " " + chapter
    };
  });
};
