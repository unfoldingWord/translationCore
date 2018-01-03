import React from 'react';
import fs from 'fs-extra';
import path from 'path-extra';
import usfmjs from 'usfm-js';
// helpers
import * as usfmHelpers from '../usfmHelpers';
import * as manifestHelpers from '../manifestHelpers';
// contstants
const IMPORTS_PATH = path.join(path.homedir(), 'translationCore', 'imports');

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

export const generateTargetLanguageBibleFromUsfm = async (usfmData, manifest, selectedProjectFilename) => {
  return new Promise ((resolve, reject) => {
    try {
      const chaptersObject = usfmjs.toJSON(usfmData).chapters;
      const bibleDataFolderName = manifest.project.id || selectedProjectFilename;
      let verseFound = false;
      Object.keys(chaptersObject).forEach((chapter) => {
        const bibleChapter = {};
        Object.keys(chaptersObject[chapter]).forEach((verse) => {
          const verseParts = chaptersObject[chapter][verse];
          bibleChapter[verse] = verseParts.join(' ');
          verseFound = true;
        });
        const filename = parseInt(chapter, 10) + '.json';
        const projectBibleDataPath = path.join(IMPORTS_PATH, selectedProjectFilename, bibleDataFolderName, filename);
        fs.outputJsonSync(projectBibleDataPath, bibleChapter);
      });
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
