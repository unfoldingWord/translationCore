import path from 'path-extra';
// helpers
import * as UsfmFileConversionHelpers from './UsfmFileConversionHelpers';
import * as ZipFileConversionHelpers from './ZipFileConversionHelpers';

export const convert = (sourceProjectPath, selectedProjectFilename) => {
  return new Promise (async(resolve, reject) => {
    try {
      if(projectHasUsfmFileExtension(sourceProjectPath)) {
        await UsfmFileConversionHelpers.convertToProjectFormat(sourceProjectPath, selectedProjectFilename);
      } else {
        // project's extension name is either .tstudio or .tcore
        await ZipFileConversionHelpers.convertToProjectFormat(sourceProjectPath, selectedProjectFilename);
      }
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

export const projectHasUsfmFileExtension = (sourceProjectPath) => {
  const projectExtensionName = path.extname(sourceProjectPath).toLowerCase();
  const usfm = ['.usfm', '.sfm', '.txt'];

  return usfm.includes(projectExtensionName);
};
