/**
 * @description: This file provides the drag and drop file upload, along with
 *               the more traditional click and open file upload system.
 * @author: Ian Hoegen, Sam Faulkner
 ******************************************************************************/
//node modules
const Dropzone = require('react-dropzone');
const electron = window.electron;
const remote = window.electron.remote;
const {dialog} = remote;
const React = require('react');
const ReactDOM = require('react-dom');
const FS = require(window.__base + '/node_modules/fs-extra');

//Bootstrap modules
const Well = require('react-bootstrap/lib/Well.js');
const Grid = require('react-bootstrap/lib/Grid.js');
const Col = require('react-bootstrap/lib/Col.js');
const Row = require('react-bootstrap/lib/Row.js');
const Glyphicon = require('react-bootstrap/lib/Glyphicon.js');

//english constants
const PROMPT = "Drag files here to upload, or click to select a file";

const FileUploader = React.createClass({

	getInitialState: function() {
	    return {
	    	filePath: null
	    };
	},

	onDrop: function(files) {
		var _this = this;
	    if (files !== undefined) {
	      	_this.setFilePath(files[0].path);
	      	if (_this.props.callback) {
	    		_this.props.callback(); //sets up the confirmation screen
	    	}
	    }

  	},

  	getPath: function() {
  		return this.state.filePath;
  	},

  	onClick: function() {
  		var _this = this;
    	dialog.showOpenDialog(
    		{
    			properties: ['openFile'],
    			filters: [
    				{name: 'JSON', extensions: ['json', 'JSON']}
    			]
    		}, 
	    	function(filename) {
	      		if (filename !== undefined) {
	      			_this.setFilePath(filename[0]);
	      			
	      			if (_this.props.callback) {
    					_this.props.callback(); //sets up the confirmation screen
    				}
	      		}
	    	}
	    );
  	},

  	setFilePath: function(value) {
  		this.setState({
  			filePath: value
  		});
  	},

  	render: function() {
    	var prompt = this.props.prompt || PROMPT;
    	
    	if (this.state.filePath != null) { //user has given us input, allow them to confirm
    		return (
    			<div
    				style={{
    					textAlign: 'center'
    				}}
    			>
    				
    				<h1>
    					<Glyphicon
    						glyph="file"
    							
    					/>
    				</h1>
    				<div>
    					{this.state.filePath}
    				</div>
    			</div>
    		);
    	}
    	else { //user needs to give us input
	    	return (
	    		
	      		<div
	      			onClick = {this.onClick}
	      		>
	        		<Dropzone 
	          			onDrop = {this.onDrop}
	          			disableClick={true}
	          			multiple={false}
	          			style={{
	          				borderWidth: '2px',
	          				borderStyle: 'dashed',
	          				borderRadius: '10px',
	          				cursor: 'pointer',
	          				minHeight: '150px'
	          			}}
	        		>
		            	<div>{prompt}</div>
		          		
	        		</Dropzone>
	      		</div>
	      				
	    	);
    	}
  	},

  	//this is unused
  /* 
  getRawFile: function(path) {
    var request = new XMLHttpRequest();

    request.open("GET", path, false);
    request.onreadystatechange = function() { 
      if (request.readyState === 4) {
        if (request.status === 200 || request.status == 0) {
          if (this.props.callback) {
            this.props.callback(rawFile.responseText);
          }
        }
      }
    }
    */

    /**
     * @description: Gets json object from json file
     * @param {string} path - file path
     * @param {function} assignCallback - callback that gets 
     	called with the parsed json as a param: assignCallback(data)
     * @param {function} errorCallback - callback that gets called in case of an error with errorCallback(err)
     */
  	getJsonFile: function(path, assignCallback, errorCallback) {
  		console.log('Path: ' + path);
  		FS.readJson(path, 
  			function(err, data) { //reads in a json object (data) from the path
  				if (err && errorCallback) {
    				errorCallback(err)
    			}
    			if (!err) {
    				assignCallback(data);
    			}
                
  			}
  		);
  	}
});

module.exports = FileUploader;