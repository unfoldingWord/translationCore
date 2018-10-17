import React from 'react';
import fs from 'fs-extra';
import path from 'path-extra';
import ospath from 'ospath';
import usfmjs from 'usfm-js';
// helpers
import * as usfmHelpers from '../usfmHelpers';
import * as manifestHelpers from '../manifestHelpers';
import wordaligner from 'word-aligner';
import * as BibleHelpers from "../bibleHelpers";
// actions
import * as ResourcesActions from "../../actions/ResourcesActions";
import _ from "lodash";
// constants
const IMPORTS_PATH = path.join(ospath.home(), 'translationCore', 'imports');

export const convertToProjectFormat = async (sourceProjectPath, selectedProjectFilename) => {
  return new Promise (async(resolve, reject) => {
    try {
      const usfmData = await verifyIsValidUsfmFile(sourceProjectPath);
      const parsedUsfm = usfmHelpers.getParsedUSFM(usfmData);
      const manifest = await generateManifestForUsfm(parsedUsfm, sourceProjectPath, selectedProjectFilename);
      await moveUsfmFileFromSourceToImports(sourceProjectPath, manifest, selectedProjectFilename);
      await generateTargetLanguageBibleFromUsfm(parsedUsfm, manifest, selectedProjectFilename);
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

/**
 * generate manifest from USFM data
 * @param {Object} parsedUsfm - The object containing usfm parsed by chapters
 * @param {string} sourceProjectPath
 * @param {string} selectedProjectFilename
 * @return {Promise<any>}
 */
export const generateManifestForUsfm = async (parsedUsfm, sourceProjectPath, selectedProjectFilename) => {
  return new Promise ((resolve, reject) => {
    try {
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
  const {languageId, bibleId} = BibleHelpers.getOLforBook(projectBibleID);
  return ResourcesActions.loadChapterResource(bibleId, projectBibleID, languageId, chapter);
};

/**
 * generate the target language bible from parsed USFM and manifest data
 * @param {Object} parsedUsfm - The object containing usfm parsed by chapters
 * @param {Object} manifest
 * @param {String} selectedProjectFilename
 * @return {Promise<any>}
 */
export const generateTargetLanguageBibleFromUsfm = async (parsedUsfm, manifest, selectedProjectFilename) => {
  return new Promise ((resolve, reject) => {
    try {
      const chaptersObject = parsedUsfm.chapters;
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
            const bibleVerse = bibleData[chapter][verse];
            const object = wordaligner.unmerge(verseParts, bibleVerse);
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
      fs.outputJsonSync(projectBibleDataPath, parsedUsfm.headers);
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
  let wordSpacing = '';
  for (let child of verseObject.children) {
    switch (child.type) {
      case 'word':
        text += (wordSpacing ? ' ' : '') + child.text;
        wordSpacing = ' ';
        break;

      case 'milestone':
        text += (wordSpacing ? ' ' : '') + parseMilestone(child);
        wordSpacing = ' ';
        break;

      default:
        if (verseObject.text) {
          text += verseObject.text;
          const lastChar = text.substr(-1);
          if ((lastChar !== ",") && (lastChar !== '.') && (lastChar !== '?') && (lastChar !== ';')) { // legacy support, make sure padding before word
            wordSpacing = '';
          }
        }
        break;
    }
  }
  return text;
};

/**
 * get text from word and milestone markers
 * @param verseObject
 * @param wordSpacing
 * @return {*}
 */
const replaceWordsAndMilestones = (verseObject, wordSpacing) => {
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
      if ((lastChar !== ",") && (lastChar !== '.') && (lastChar !== '?') && (lastChar !== ';')) { // legacy support, make sure padding before word
        wordSpacing = '';
      }
    } else {
      if (verseObject.children) { // handle nested
        const verseObject_ = _.cloneDeep(verseObject);
        let wordSpacing_ = '';
        const length = verseObject.children.length;
        for (let i = 0; i < length; i++) {
          const flattened = replaceWordsAndMilestones(verseObject.children[i], wordSpacing_);
          wordSpacing_ = flattened.wordSpacing;
          verseObject_.children[i] = flattened.verseObject;
        }
        verseObject = verseObject_;
      }
    }
  }
  return {verseObject, wordSpacing};
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
      const flattened = replaceWordsAndMilestones(verseObject, wordSpacing);
      wordSpacing = flattened.wordSpacing;
      return flattened.verseObject;
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
  return split.length > 1 ? split[1] : "";
};
