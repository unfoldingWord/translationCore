import fs from 'fs-extra';

function zip(srcFolder, zipFilePath, callback) {
  fs.writeFileSync(zipFilePath, 'hello');
  callback();
}

export default zip;
