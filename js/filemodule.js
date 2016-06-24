var FM = (function() {
  return {
    uploadedFile: "",
    uploadedFileContent: "",

/**
 * @description: This function reads a file and returns the text that is
 *               contained within the file.
 * @author: Ian Hoegen
 * @param {File} file - A file that is to be uploaded by the user.
 ******************************************************************************/
    readFile: function(file) {
      var openedFile;
      var read = new FileReader();
      console.log(read);
      read.readAsBinaryString(file);

      read.onloadend = function() {
        openedFile = read.result;
        uploadedFileContent = openedFile;
        console.log(uploadedFileContent);
      };
    }

  };
})();
module.exports = FM;
