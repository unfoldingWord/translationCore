/**
 * @description: This file provides the drag and drop file upload, along with
 *               the more traditional click and open file upload system.
 * @author: Ian Hoegen
 ******************************************************************************/
const Dropzone = require('react-dropzone');
const app = require('electron');
const FM = require('./js/filemodule.js');
const menubar = require('./js/menubar.js');
const {remote} = require('electron');
const {Menu, MenuItem} = remote;

var FileUploader = React.createClass({
  onDrop: function(files) {
    FM.uploadedFile = files[0];
    FM.readFile(FM.uploadedFile);
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

// Generates the menu bar with appropriate click functions.
menubar.template[0].submenu = [
  {label: 'Import Project',
  click(item, focusedWindow) {
    ReactDOM.render(<FileUploader />, document.getElementById('content'));
  }}];
var template = menubar.template;
var menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
