const React = require('react');

const Dropzone = require('react-dropzone');

const remote = window.electron.remote;
const {dialog} = remote;

const FileImport = require('./FileImport');

const style = require('./Style');

const DragDrop = React.createClass({
  onDrop: function(files) {
    if (files !== undefined) {
      FileImport(files[0].path);
    }
  },
  onClick: function() {
    dialog.showOpenDialog({
      properties: ['openDirectory']
    }, function(filename) {
      if (filename !== undefined) {
        FileImport(filename[0]);
      }
    });
  },

  render: function() {
    return (
    <div onClick = {this.onClick} >
        <Dropzone onDrop = {this.onDrop}
        disableClick={true} multiple={false} style={style.dropzone.main}
        activeStyle={style.dropzone.active}>
            <div style={style.dropzone.text}>
              <center>
                Drag files here to upload, or click to select a file
              </center>
            </div>
      </Dropzone>
    </div>
  );
  }

});

module.exports = DragDrop;
