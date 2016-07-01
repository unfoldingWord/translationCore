
//UploadForm.js//

//Node Modules
const React = require('react');

//Components
const FileUploader = require('./FileUploader');
const ErrorModal = require('./ErrorModal');

//Bootstrap
const Glyphicon = require('react-bootstrap/lib/Glyphicon.js');
const Well = require('react-bootstrap/lib/Well.js');
const Button = require('react-bootstrap/lib/Button.js');

//English constants
const JSON_SPECIFIER = "Drag and drop or click to import .JSON file",
	UPLOAD_FILE = "Upload File",
	BACK = "Back",
	UNABLE_TO_OPEN_MES = "Unable to open file: ",
    UNABLE_TO_OPEN_TITLE = "Open failed";

//UploadForm
const UploadForm = React.createClass({

    uploadFile: function() {
    	var _this = this;
		if (this.refs.FileUploader) { //sanity check
			this.refs.FileUploader.getJsonFile(this.refs.FileUploader.getPath(),
				function(data) { //assignCallback
					if (_this.props.assignCallback) {
						_this.props.assignCallback(data, _this.refs.FileUploader.getPath());

						
					}
					/* Don't close it here, close it in Assign callback, 
						after TranslationWordsComponent verifies it */
					// if (_this.props.closeModal) {
					// 	_this.props.closeModal();
					// }
				}, 

				function(err) { //errorcallback
					if (_this.props.postErrorModal) {
						_this.props.postErrorModal(
							<ErrorModal
								glyph={
									<Glyphicon
										glyph={"remove-circle"}
										style={{
											color: 'red'
										}}
									/>
								}
								
								message={UNABLE_TO_OPEN_MES + 
									_this.refs.FileUploader.getPath() + 
									'\n\nError: ' + err}
								title={UNABLE_TO_OPEN_TITLE}
								closeCallback={
									function() {
										if (_this.props.closeModal) {
											_this.props.closeModal();
										}
									}
								}
							/>
						);
					}
				}
			);
		}
    },

    //Displays a confirmation screen
    displayFile: function() {
    	
    	var _this = this;
    	if (this.props.assignModalButtons) {
    		console.log('assigning buttons');
    		this.props.assignModalButtons([ /* gives the parent modal object
    											more buttons and more functionality
    										*/
    			//Upload file button
    			<Button 
    				bsStyle="primary"
    				onClick={this.uploadFile}
    				key={1}
    			>
    				{UPLOAD_FILE}
    			</Button>,
    			//Back button
    			<Button 
    				onClick={
    					function() {
    						if (_this.refs.FileUploader) {
    							_this.refs.FileUploader.setFilePath(null);
    						}
    						_this.props.assignModalButtons([]); /*resets the buttons 
    																to how they were
    															*/
    					}
    				}
    				key={2}
    			>
    				{BACK}
    			</Button>
    		]);
    	}
    },

    render: function() {
		return (
			<Well
		    	bsSize="sm"
			>
				<FileUploader
					ref={'FileUploader'}
					callback={this.displayFile}
					prompt={JSON_SPECIFIER}
				/>
			</Well>
		);
    }  
});

module.exports = UploadForm;