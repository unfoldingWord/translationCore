const React = require('react');

const Dropzone = require('react-dropzone');

const remote = window.electron.remote;
const {dialog} = remote;

const FileImport = require('./FileImport');

const style = {
                dropzone: {
                  active: {
                    border: '2px solid #727272',
                    backgroundColor: '#f5f5f5'
                  },
                  text: {
                    lineHeight: '200px',
                    verticalAlign: 'middle',
                    width: '100%'
                  },
                  main: {
                    width: '100%',
                    color: '#212121',
                    height: '200px',
                    border: '2px dashed #727272',
                    borderRadius: '5px',
                    fontSize: '25px'
                  }
                }
              }

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
