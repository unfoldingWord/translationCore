import React from 'react';
import fs from 'fs-extra';
import path from 'path-extra';
import ospath from 'ospath';
import usfmjs from 'usfm-js';
// helpers
import * as usfmHelpers from '../usfmHelpers';
import * as manifestHelpers from '../manifestHelpers';
import * as AlignmentHelpers from "../AlignmentHelpers";
import  * as VerseObjectHelpers from "../VerseObjectHelpers";
import * as BibleHelpers from "../bibleHelpers";
// actions
import * as ResourcesActions from "../../actions/ResourcesActions";
// constants
const IMPORTS_PATH = path.join(ospath.home(), 'translationCore', 'imports');

export const convertToProjectFormat = async (sourceProjectPath, selectedProjectFilename) => {
  return new Promise (async(resolve, reject) => {
    try {
      const usfmData = await verifyIsValidUsfmFile(sourceProjectPath);
      const manifest = await generateManifestForUsfm(usfmData, sourceProjectPath, selectedProjectFilename);
      await moveUsfmFileFromSourceToImports(sourceProjectPath, manifest, selectedProjectFilename);
      await generateTargetLanguageBibleFromUsfm(usfmData, manifest, selectedProjectFilename);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

export const verifyIsValidUsfmFile = async (sourceProjectPath) => {
  return new Promise ((resolve, reject) => {
    const usfmData = usfmHelpers.loadUSFMFile(path.join(sourceProjectPath));
    if (usfmData.includes('\\h ') || usfmData.includes('\\id ')) { // moved verse checking to generateTargetLanguageBibleFromUsfm
      resolve(usfmData);
    } else {
      reject(
        <div>
          The project you selected ({sourceProjectPath}) is an invalid usfm project. <br/>
          Please verify the project you selected is a valid usfm file.
        </div>
      );
    }
  });
};

export const generateManifestForUsfm = async (usfmData, sourceProjectPath, selectedProjectFilename) => {
  return new Promise ((resolve, reject) => {
    try {
      const parsedUsfm = usfmjs.toJSON(usfmData);
      const manifest = manifestHelpers.generateManifestForUsfmProject(parsedUsfm);
      const manifestPath = path.join(IMPORTS_PATH, selectedProjectFilename, 'manifest.json');
      fs.outputJsonSync(manifestPath, manifest);
      resolve(manifest);
    } catch (error) {
      console.log(error);
      reject(
        <div>
          Something went wrong when generating a manifest for ({sourceProjectPath}).
        </div>
      );
    }
  });
};

export const moveUsfmFileFromSourceToImports = async (sourceProjectPath, manifest, selectedProjectFilename) => {
  return new Promise ((resolve, reject) => {
    try {
      const usfmData = fs.readFileSync(sourceProjectPath);
      const projectId = manifest && manifest.project && manifest.project.id ? manifest.project.id : undefined;
      const usfmFilename = projectId ? projectId + '.usfm' : selectedProjectFilename + '.usfm';
      const newUsfmProjectImportsPath = path.join(IMPORTS_PATH, selectedProjectFilename, usfmFilename);
      fs.outputFileSync(newUsfmProjectImportsPath, usfmData);
      resolve();
    } catch (error) {
      console.log(error);
      reject(
        <div>
          {
            sourceProjectPath ?
            `Something went wrong when importing (${sourceProjectPath}).`
            :
            `Something went wrong when importing your project.`
          }
        </div>
      );
    }
  });
};

/**
 * get the original language chapter resources for project book
 * @param {string} projectBibleID
 * @param {string} chapter
 * @return {Object} resources for chapter
 */
export const getOriginalLanguageChapterResources = function (projectBibleID, chapter) {
  const resourceLanguage = (BibleHelpers.isOldTestament(projectBibleID)) ? 'he' : 'grc';
  const bibleID = (BibleHelpers.isOldTestament(projectBibleID)) ? 'uhb' : 'ugnt';
  const bibleData = ResourcesActions.loadChapterResource(bibleID, projectBibleID, resourceLanguage, chapter);
  return bibleData;
};

export const generateTargetLanguageBibleFromUsfm = async (usfmData, manifest, selectedProjectFilename) => {
  return new Promise ((resolve, reject) => {
    try {
      const importObject = usfmjs.toJSON(usfmData, {convertToInt: ["occurrence", "occurrences"]});
      const chaptersObject = importObject.chapters;
      const bibleDataFolderName = manifest.project.id || selectedProjectFilename;
      let verseFound = false;
      Object.keys(chaptersObject).forEach((chapter) => {
        let chapterAlignments = {};
        const bibleChapter = {};
        const verses = Object.keys(chaptersObject[chapter]);

        // check if chapter has alignment data
        const alignmentIndex = verses.findIndex(verse => {
          const verseParts = chaptersObject[chapter][verse];
          let alignmentData = false;
          for (let part of verseParts.verseObjects) {
            if (part.type === "milestone") {
              alignmentData = true;
              break;
            }
          }
          return alignmentData;
        });
        const alignmentData = (alignmentIndex >= 0);
        let bibleData;
        if (alignmentData) {
          bibleData = getOriginalLanguageChapterResources(bibleDataFolderName, chapter, bibleData);
        }

        verses.forEach((verse) => {
          const verseParts = chaptersObject[chapter][verse];
          bibleChapter[verse] = getUsfmForVerseContent(verseParts).trim();

          if (alignmentData && bibleData && bibleData[chapter]) {
            const wordList = VerseObjectHelpers.getWordList(bibleData[chapter][verse]);
            const resourceString =  VerseObjectHelpers.mergeVerseData(wordList);
            const object = AlignmentHelpers.unmerge(verseParts.verseObjects, resourceString);
            chapterAlignments[verse] = {
              alignments: object.alignment,
              wordBank: object.wordBank
            };
          }
          verseFound = true;
        });
        const filename = parseInt(chapter, 10) + '.json';
        const projectBibleDataPath = path.join(IMPORTS_PATH, selectedProjectFilename, bibleDataFolderName, filename);
        fs.outputJsonSync(projectBibleDataPath, bibleChapter);

        if (alignmentData) {
          const alignmentDataPath = path.join(IMPORTS_PATH, selectedProjectFilename, '.apps', 'translationCore', 'alignmentData', bibleDataFolderName, filename);
          fs.outputJsonSync(alignmentDataPath, chapterAlignments);
        }
      });
      const projectBibleDataPath = path.join(IMPORTS_PATH, selectedProjectFilename, bibleDataFolderName, 'headers.json');
      fs.outputJsonSync(projectBibleDataPath, importObject.headers);
      if (!verseFound) {
        reject(
          <div>
            {
              selectedProjectFilename ?
                `No chapter & verse found in project (${selectedProjectFilename}).`
                :
                `No chapter & verse found in your project.`
            }
          </div>
        );
        return;
      }
      // generating and saving manifest for target language for scripture pane to use as reference
      const targetLanguageManifest = {
        language_id: manifest.target_language.id || "",
        language_name: manifest.target_language.name || "",
        direction: manifest.target_language.direction || "",
        subject: "Bible",
        resource_id: "targetLanguage",
        resource_title: "",
        description: "Target Language"
      };
      const projectBibleDataManifestPath = path.join(IMPORTS_PATH, selectedProjectFilename, bibleDataFolderName, "manifest.json");
      fs.outputJsonSync(projectBibleDataManifestPath, targetLanguageManifest);
      resolve();
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};

const parseMilestone = function (verseObject) {
  let text = "";
  for (let child of verseObject.children) {
    if (child.type === 'word') {
      text += (text ? ' ' : '') + child.text;
    } else if (child.type === 'milestone') {
      text += (text ? ' ' : '') + parseMilestone(child);
    }
  }
  return text;
};

/**
 * @description merge verse data into a string - flatten milestones and words and then save as USFM string
 * @param {Object|Array} verseData
 * @return {String}
 */
export const getUsfmForVerseContent = (verseData) => {
  if (verseData.verseObjects) {
    let wordSpacing = '';
    const flattenedData = verseData.verseObjects.map(verseObject => {
      let text = '';
      if (verseObject.type === 'word') {
        text = wordSpacing + verseObject.text;
      } else if (verseObject.type === 'milestone') {
        text = wordSpacing + parseMilestone(verseObject);
      }
      if (text) { // replace with text object
        verseObject = {
          type: "text",
          text
        };
        wordSpacing = ' ';
      } else {
        wordSpacing = ' ';
        if (verseObject.type === 'text') {
          const lastChar = verseObject.text.substr(-1);
          if ((lastChar === "'") || (lastChar === '"')) { // special case: no extra spacing after quotes or apostrophes before words
            wordSpacing = '';
          }
        }
      }
      return verseObject;
    });
    verseData = { // use flattened data
      verseObjects: flattenedData
    };
  }
  const outputData = {
    "chapters": {},
    "headers": [],
    "verses": {
      "1": verseData
    }
  };
  const USFM = usfmjs.toUSFM(outputData, {chunk: true});
  const split = USFM.split("\\v 1 ");
  return split.length > 1 ? split[1] : USFM;
};
