import React from 'react';
import fs from 'fs-extra';
import path from 'path-extra';
// helpers
import usfmHelpers from '../usfmHelpers';
import { generateTimestamp } from '../TimestampGenerator';
/**
 * @Description:
 * Helpers for converting USFM files into a project folder
 */
// contstants
const IMPORTS_PATH = path.join(path.homedir(), 'translationCore', 'imports');


export const convertToProjectFormat = async (sourceProjectPath, selectedProjectFilename) => {
  return new Promise (async(resolve, reject) => {
    try {
      await verifyIsValidUsfmFile(sourceProjectPath);
      await moveUsfmProjectFromSourceToImports(sourceProjectPath, selectedProjectFilename);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

export const verifyIsValidUsfmFile = async (sourceProjectPath) => {
  return new Promise ((resolve, reject) => {
    let usfmData = usfmHelpers.loadUSFMFile(path.join(sourceProjectPath));
    if (usfmData.includes('\\h') || usfmData.includes('\\id') || usfmData.includes('\\v'))
      resolve();
    else
      reject(
        <div>
          The project you selected ({sourceProjectPath}) is an invalid usfm project. <br />
          Please verify the project you selected is a valid usfm file.
        </div>
      );
  });
};

export const moveUsfmProjectFromSourceToImports = async (sourceProjectPath, selectedProjectFilename) => {
  return new Promise ((resolve, reject) => {
    try {
      const timestampFilename = generateTimestamp();
      const usfmData = fs.readFileSync(sourceProjectPath);
      const newUsfmProjectImportsPath = path.join(IMPORTS_PATH, timestampFilename, selectedProjectFilename, '.usfm');
      fs.outputFileSync(newUsfmProjectImportsPath, usfmData);
      resolve();
    } catch (error) {
      reject(
        <div>
          Something went wrong trying to import ({sourceProjectPath}).
        </div>
      );
    }
  });
};
