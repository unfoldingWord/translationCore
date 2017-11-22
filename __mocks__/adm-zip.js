'use strict';
import fs from 'fs-extra';
import path from 'path-extra';
// constant
const TEMP_IMPORT_PATH = path.join(path.homedir(), 'translationCore', 'imports', 'temp');

class AdmZip {
  constructor(sourcePath) {
    this.sourcePath = sourcePath;
  }

  // mocking unzipping a file using fs-extra mock
  extractAllTo(destinationPath, options) {
    // using fs to mock saving the files in file system.
    const fileName = this.sourcePath.split('/').pop();
    const fileDestinationPath = path.join(destinationPath, fileName);
    // fileDestinationPath is the path and the array is the files in the path
    fs.__setMockFS({
      [TEMP_IMPORT_PATH]: ['id_tit_text_ulb', 'manifest.json', '.DS_Store'],
      [fileDestinationPath]: ['01', '02', '03', 'front', 'LICENSE.md', 'manifest.json']
    });
  }
}

export default AdmZip;
