/** *****************************************************************************
 * @description: This file provides the drag and drop file upload, along with
 *               the more traditional click and open file upload system.
 * @author: Ian Hoegen
 ******************************************************************************/
var Dropzone = require('react-dropzone');
var uploadedFile;
var FileUploader = React.createClass({
  onDrop: function(files) {
    readFile(files[0]);
  },

  render: function() {
    return (
    <div>
      <Dropzone onDrop = {this.onDrop}>
        <div>Drag files here to upload, or click to select a file. </div>
      </Dropzone>
    </div>
  );
  }

});

ReactDOM.render(<FileUploader />, document.getElementById('content'));
/** *****************************************************************************
 * @description: This function reads a file and returns the text that is
 *               contained within the file.
 * @author: Ian Hoegen
 * @param {File} file - A file that is to be uploaded by the user.
 ******************************************************************************/
function readFile(file) {
  var openedFile;
  var read = new FileReader();
  read.readAsBinaryString(file);
  read.onloadend = function() {
    openedFile = read.result;
    uploadedFile = openedFile;
  };
}
