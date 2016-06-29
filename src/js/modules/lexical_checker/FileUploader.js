/**
 * @description: This file provides the drag and drop file upload, along with
 *               the more traditional click and open file upload system.
 * @author: Ian Hoegen
 ******************************************************************************/
const Dropzone = require('react-dropzone');
const electron = require('electron');
const remote = window.electron.remote;
const {dialog} = remote;
const React = require('react');
const ReactDOM = require('react-dom');
var Well = require('react-bootstrap/lib/Well.js');

var PROMPT = "Drag files here to upload, or click to select a file";

var FileUploader = React.createClass({
  onDrop: function(files) {
    if (files !== undefined) {
      tgetRawFile(files[0].path);
    }
  },

  onClick: function() {
    dialog.showOpenDialog({
      properties: ['openDirectory']
    }, function(filename) {
      if (filename !== undefined) {
        getRawFile(filename[0]);
      }
    });
  },

  render: function() {
    var prompt = this.props.prompt || PROMPT;
    return (
      <div onClick = {this.onClick}>
        <Dropzone 
          onDrop = {this.onDrop}
          disableClick={true}
          multiple={false}
        >
          <Well>
            <div>{prompt}</div>
          </Well>
        </Dropzone>
      </div>
    );
  },

  getRawFile: function(path) {
    var request = new XMLHttpRequest();

    request.open("GET", path, false);
    request.onreadystatechange = function() { /* This checks for specific state and statuses 
                                                  of the XMLRequest
                                              */
      if (request.readyState === 4) {
        if (request.status === 200 || request.status == 0) {
          if (this.props.callback) {
            this.props.callback(rawFile.responseText);
          }
        }
      }
    }
    
  }
});

module.exports = FileUploader;