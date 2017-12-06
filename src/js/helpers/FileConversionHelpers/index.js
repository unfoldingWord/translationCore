import path from 'path-extra';
// helpers
import * as UsfmFileConversionHelpers from './UsfmFileConversionHelpers';
import * as ZipFileConversionHelpers from './ZipFileConversionHelpers';

export const convert = (sourceProjectPath, selectedProjectFilename) => {
  if(projectHasUsfmFileExtension(sourceProjectPath)) {
    UsfmFileConversionHelpers.convertToProjectFormat(sourceProjectPath, selectedProjectFilename);
  } else {
    // project's extension name is either .tstudio or .tcore
    ZipFileConversionHelpers.convertToProjectFormat(sourceProjectPath, selectedProjectFilename);
  }
};

export const projectHasUsfmFileExtension = (sourceProjectPath) => {
  const projectExtensionName = path.extname(sourceProjectPath);
  const usfm = ['.usfm', '.sfm', '.txt'];

  return usfm.includes(projectExtensionName);
};
