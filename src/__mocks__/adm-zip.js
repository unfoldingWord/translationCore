import fs from 'fs-extra';
import path from 'path-extra';
// constant
import { TEMP_IMPORT_PATH } from '../js/common/constants';

class AdmZip {
  constructor(sourcePath) {
    this.sourcePath = sourcePath;
  }

  /**
   * mocking unzipping a file using fs-extra mock
   * @param {*} destinationPath
   * @param {*} overwrite If the file already exists at the target path,
   * the file will be overwriten if this is true. Default:false.
   */
  extractAllTo(destinationPath, overwrite) {
    // using fs to mock saving the files in file system.
    const fileName = this.sourcePath.split(path.sep).pop();
    const fileDestinationPath = path.join(destinationPath, fileName);

    // fileDestinationPath is the path and the array is the files in the path
    fs.__setMockFS({
      [TEMP_IMPORT_PATH]: ['id_tit_text_ulb', 'manifest.json', '.DS_Store'],
      [fileDestinationPath]: ['01', '02', '03', 'front', 'LICENSE.md', 'manifest.json'],
    });
  }
}

export default AdmZip;
