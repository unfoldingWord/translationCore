
//TranslationWords//

//Node modules
const React = require('react');
const ReactDOM = require('react-dom');
const FS = require(window.__base + '/node_modules/fs-extra');
const electron = window.electron;
const remote = window.electron.remote;
const {dialog} = remote;


//Module imports
const TranslationNotesHTMLScraper = require('./HTMLScraper.js');
const FileUploader = require('./FileUploader.js');
const ErrorModal = require('./ErrorModal.js');
const UploadForm = require('./UploadForm');

//Bootstrap for dayz
const FormGroup = require('react-bootstrap/lib/FormGroup.js');
const FormControl = require('react-bootstrap/lib/FormControl.js');
const ControlLabel = require('react-bootstrap/lib/ControlLabel.js');
const Well = require('react-bootstrap/lib/Well.js');
const Button = require('react-bootstrap/lib/Button.js');
const Glyphicon = require('react-bootstrap/lib/Glyphicon.js');
const ButtonGroup = require('react-bootstrap/lib/ButtonGroup.js');
const Modal = require('react-bootstrap/lib/Modal.js');
const HelpBlock = require('react-bootstrap/lib/HelpBlock.js');
const ProgressBar = require('react-bootstrap/lib/ProgressBar.js');

//hardcoded english constants
const BOOK_QUERY = 'Type in Book Name',
    BOOK_EXAMPLE = 'Ex: "Ephesians"',
    DOWNLOAD_BOOK = "Download Book",
    UPLOAD_FROM_COMPUTER = "Upload Book",
    SAVE_TO_COMPUTER = "Save Book",
    QUERYING_BOOKS = "Retrieving information",
    DISCONNECTED_TITLE = "Disconnected From Internet",
    DISCONNECTED_MESSAGE = "Failed to retrieve a list of books from: ",
    CLOSE = "Close",
    CANCEL = "Cancel",
    UPLOAD_FILE = "Upload File",
    JSON_SPECIFIER = "Drag and drop or click to import .JSON file",
    UNABLE_TO_SAVE_MES = "Unable to save file: ",
    UNABLE_TO_SAVE_TITLE = "Save Failed",
    UNABLE_TO_OPEN_MES = "Unable to open file: ",
    UNABLE_TO_OPEN_TITLE = "Open failed",
    INVALID_BOOK_MESSAGE = " is not a valid translationNotes object",
    INVALID_BOOK_TITLE = "Unable to parse file";


const TranslationNotesComponent = React.createClass({
    //this requires the internet, which at some point there needs to be a way to get the information
    //from local storage
    tNHtmlScraper: new TranslationNotesHTMLScraper(),

    bookAbbreviations: null,
    currentlyLoadedBooks: {},
    currentBook: null,
    errorThrown: false,
    currentModal: null,
    previousModals: [],

    getInitialState: function() {
		return {
	    	downLoadButtonDisabled: true,
	    	saveButtonDisabled: true,

	    	showProgressBar: false,
	    	currentDownloadProgress: 0,
	    	maxDownloadProgress: 0,

	    	showModal: false
		}
    },
    
    componentWillMount: function() {
		var _this = this;

		this.tNHtmlScraper.getBookAbbreviations( 
		    function(abbreviations) { //setter function
				_this.bookAbbreviations = abbreviations;
				if (_this.refs.BookForm) {
			    	_this.refs.BookForm.changeText(_this.refs.BookForm.state.value); /* 
													this makes the form change state and 
													updates the little icon to show the 
													user we've gotten the list of books
													from the internet
												     */
			    	_this.refs.BookForm.changePlaceHolder(BOOK_EXAMPLE);
			    	_this.refs.BookForm.changeStyle({
						cursor: 'auto'
			    	});
				}
		    },
		    null, //finishedFunction
		    function() { //error function
		    	_this.setCurrentModal(
		    		<ErrorModal
						glyph={
							<Glyphicon
								glyph={"remove-circle"}
								style={{
									color: 'red'
								}}
							/>
						}
						buttons={[
							<UploadButton 
								callback={_this.uploadFile}
								key={1}
							/>
						]}
						message={DISCONNECTED_MESSAGE + ' ' + _this.tNHtmlScraper.getBaseLink()}
						title={DISCONNECTED_TITLE}
						closeCallback={
							function() {
								_this.modalClosed();
								//disable the book form because we've had an error
								if (_this.refs.BookForm) {
									_this.refs.BookForm.disable();
								}

								_this.errorThrown = true; //this invalidates the bookform
							}
						}
					/>
		    	);
		    }
		);
    },

    //Sets the current modal, or if there already is one it pushes it onto a stack
    setCurrentModal: function(modal) {
    	if (this.currentModal) {
    		this.previousModals.push(this.currentModal);
    		this.currentModal = null;
    	}
    	this.currentModal = modal;
    	this.setState({
    		showModal: true
    	});
    },

    modalClosed: function() {
    	if (this.currentModal) { //sanity check
    		this.currentModal = this.previousModals.pop() || null;
    	}

    	this.setState({
    		showModal: (this.currentModal != null)
    	});
    },

    uploadFile: function() {
    	var _this = this;
    	/*internal modal that needs to be it's own contained component so that
    	  it can update it's own state
    	*/
    	var UploadModal = React.createClass({

    		getInitialState: function() {
    		    return {
    		        buttons: []  
    		    };
    		},

    		render: function() {
    			return (
    				<Modal show={true} onHide={_this.modalClosed}>
		    			<Modal.Header>
		    				<Modal.Title>
		    					<span>
		    						<Glyphicon
		    							glyph="upload"
		    						/>
		    						{' ' + UPLOAD_FILE}
		    					</span>
		    				</Modal.Title>
		    			</Modal.Header>
		    			<Modal.Body>
		    				{/* Mind the difference between _this and this!!! */}
		    				<UploadForm
		    					assignModalButtons={this.assignButtons}
				    			postErrorModal={_this.setCurrentModal}
				    			closeModal={_this.modalClosed}
				    			assignCallback={
				    				function(data, path) {
				    					if (data) { //if we get an error this will be undefined
				    						if (_this.validateData(data)) {
				    							//This is where we actually assign the book!
				    							_this.currentBook = data;
				    							console.dir(_this.currentBook);
				    							_this.setState({
				    								saveButtonDisabled: (_this.currentBook == null)
				    							});
				    							_this.modalClosed();
				    						}
				    						else {
				    							_this.setCurrentModal(
				    								<ErrorModal
														glyph={
															<Glyphicon
																glyph={"remove-circle"}
																style={{
																	color: 'red'
																}}
															/>
														}
														buttons={[]}
														message={path + ' ' + INVALID_BOOK_MESSAGE}
														title={INVALID_BOOK_TITLE}
														closeCallback={_this.modalClosed}
						
													/>
				    							);
				    						}
				    					}
				    				}	
				    			}
		    				/>
		    			</Modal.Body>
		    			<Modal.Footer>
		    				{this.state.buttons}
		    				<Button
		    					onClick={_this.modalClosed}
		    				>
		    					{CANCEL}
		    				</Button>
		    			</Modal.Footer>
		    		</Modal>
    			);
    		},

    		assignButtons: function(buttonArray) {
    			this.setState({
    				buttons: buttonArray
    			});
   			 }
    	});	
    	this.setCurrentModal(<UploadModal />);
    },

    /**
     * @description: A function to verify that a given JSON is 
     *	actually an object of translation notes
     * @param {jsonObject} data - A valid json object, though not necessarily a 'valid book'
     */
    validateData: function(data) {
    	if (data && data['abbreviation']) {
    		return true;
    	}
    	return false;
    },

    disableDownloadButton: function() {
    	if (!this.state.downLoadButtonDisabled) {
    		this.setState({
    			downLoadButtonDisabled: true
    		});
    	}
    },

    enableDownloadButton: function() {
    	if (this.state.downLoadButtonDisabled) {
    		this.setState({
    			downLoadButtonDisabled: false
    		});
    	}
    },


    render: function() {
		var _this = this;
		var currentModal = null;
		if (this.currentModal && this.state.showModal) {
			currentModal = this.currentModal;
		}
			
		
	    // return (
		   //  <UploadForm
		   //  	assignCallback={
		   //  		function(data) {
		   //  			_this.currentBook = data;
		   //  			console.dir(_this.currentBook);
		   //  		}	
		   //  	}
		   //  	postErrorModal={this.setCurrentModal}
		   //  	closeModal={this.modalClosed}
		   //  />
	    // );
		
	    return (
			<div>
				<Well
					style={{
						display: this.state.showProgressBar ? 'block' : 'none'
					}}
				>
					<ProgressBar
						
						now={this.state.currentDownloadProgress}
						min={0}
						max={this.state.maxDownloadProgress}
					/>
				</Well>
				{/* This isn't shown until showModal is called */ }
				{
					currentModal
				}

				<BookForm
		    		validateBook = {this.validateBook}
		    		ref = {'BookForm'}
		    		enableDownload={this.enableDownloadButton}
		    		disableDownload={this.disableDownloadButton}
		    		callback={this.getBook}
				/>
				<br />
				<ButtonGroup>
					<UploadButton 
						callback={this.uploadFile}
					/>
					{/* Download button */}
					<Button 
		    			onClick = {this.getBook}
		    			disabled = {this.state.downLoadButtonDisabled}
					>
						<Glyphicon
		    				glyph='download'
						/>
						<span>
							{' ' + DOWNLOAD_BOOK}
		    			</span>
					</Button>
					{/* Save button */}
					<Button 
						onClick = {this.saveBook}
						disabled = {this.state.saveButtonDisabled}
					>
						<Glyphicon
							glyph='floppy-disk'
						/>
						<span>
							{' ' + SAVE_TO_COMPUTER}
						</span>
					</Button>
				</ButtonGroup>
			</div>
	    );
		
    },

    saveBook: function() {
    	var _this = this;
    	if (this.currentBook) {
    		var filePath = this.currentBook['abbreviation'] + '.json';
    		dialog.showSaveDialog(
    			{
    				"title": "Save translationNotes for " + this.currentBook['abbreviation'],
    				"defaultPath": filePath,
    				"buttonLabel": SAVE_TO_COMPUTER,
    			},
    			function(path) { //dialog callback
    				if (path) {
	    				FS.outputJson(path, _this.currentBook, 
		    				function(err) { //filestream's callback
		    					if (err) {
		    						_this.setCurrentModal(
		    							<ErrorModal
											glyph={
												<Glyphicon
													glyph={"remove-circle"}
													style={{
														color: 'red'
													}}
												/>
											}
											
											message={UNABLE_TO_SAVE_MES + path + '\n\nError: ' + err}
											title={UNABLE_TO_SAVE_TITLE}
											closeCallback={
												function() {
													_this.modalClosed();

												}
											}
										/>

		    						);
		    					}
							}
		    			);
	    			}
    			}
    		);
   		}
    },

    //Downloads the book from the internet, fetches the name of the book from the book form
    getBook: function() {
    	
			
    	if (!this.refs.BookForm || 
    		this.validateBook(this.refs.BookForm.getValue()) != 'success') { //sanity check
    		return;
    	}

    	var _this = this;
    	var bookAbr = this.refs.BookForm.getValue();

    	this.refs.BookForm.setHidden(true);
    	
    	this.setState({
    		currentDownloadProgress: 0,
    		showProgressBar: true
    	});

    	this.tNHtmlScraper.downloadEntireBook(bookAbr,
    		function(finished, max) { //progress callback
    			//console.log('finished: ' + finished + '/' + max);
    			_this.setState({    				
    				currentDownloadProgress: finished,
    				maxDownloadProgress: max
    			});
    		},
    		function() { //done callback
    			_this.currentlyLoadedBooks[bookAbr] = _this.tNHtmlScraper.getBook(bookAbr);
    			_this.currentlyLoadedBooks[bookAbr]['abbreviation'] = bookAbr;

    			_this.refs.BookForm.setHidden(false);
    			
    			_this.currentBook = _this.currentlyLoadedBooks[bookAbr];
    			var doesCurrentBookExist = _this.currentBook != undefined;
    			_this.setState({
    				showProgressBar: false,
    				saveButtonDisabled: !doesCurrentBookExist
    			});
    		}
    	);
    },

    validateBook: function(str) {
    	if (this.errorThrown) {
			/*An error was thrown and we're unable to 
				access the bookAbbreviations
			*/
			
    		return 'error';
    	}
		if (!this.bookAbbreviations) { /* this is hacky, it will show a warning
						  				even if the user has typed in a valid 
										book before we've gotten the book names
										from the gogs server using the HTML scraper
					     			  */
			
		    return 'warning';
		}
		if (str.length == 0) {
			return;
		}
		if (str in this.bookAbbreviations) {
				    
		    return 'success';
		}
		else {
		    return 'error';
		}
    }
});

/* A button that presumably triggers the upload form. Defined here so that it can
	be used in more than one component
*/
var UploadButton = React.createClass({
	render: function() {
		return (
			<Button
	    		onClick={this.props.callback}
			>
		
				<Glyphicon
	    			glyph='upload'
				/>
				<span>
					{' ' + UPLOAD_FROM_COMPUTER}
	    		</span>
			</Button>
		);		
	}
});

//BookForm
var BookForm = React.createClass({
    
    getInitialState: function() {
		return {
		    value: '',
		    placeHolder: QUERYING_BOOKS,
		    style: {
				cursor: 'wait'
		    },
		    disabled: false,
		    hidden: false
		};
    },

    validationState: null,

    getValidationState: function() {
		var value = this.state.value;
		this.validationState = this.props.validateBook(value);
		return this.validationState;
    },

    handleChange: function(event) {
		this.setState({
	    	value: event.target.value
		});
		var validation = this.props.validateBook(event.target.value)
		if (validation == 'success') {
			this.props.enableDownload();
		}
		else {
			this.props.disableDownload();
		}
    },

    getValue: function() {
    	return this.state.value;
    },

    changeText: function(str) {
		this.setState({
	    	value: str
		});
    },

    changePlaceHolder: function(str) {
		this.setState({
	    	placeHolder: str
		});
    },

    changeStyle: function(style) {
		this.setState({
	    	style: style
		});	    
    },
    
    disable: function() {
    	if (!this.state.disabled) {
    		this.setState({
    			disabled: true
    		});

    		this.changeStyle({
    			cursor: 'not-allowed'
    		});
    	}
    },

    setHidden: function(value) {
    	this.setState({
    		hidden: value
    	});
    },

    render: function() {
    	var _this = this;
		return (
			<Well
				style={{
					display: this.state.hidden ? 'none' : 'block'
				}}
				bsSize="sm">
				<form
					onSubmit={function(e) {
						e.preventDefault();
						if (_this.props.callback) {
							_this.props.callback();
						}
					}}
	    		>
					<FormGroup
	    				validationState={this.getValidationState()}
					>
						<ControlLabel>{BOOK_QUERY}</ControlLabel>
						<FormControl
	    					type="text"
	    					value={this.state.value}
	    					placeholder={this.state.placeHolder}
	    					onChange={this.handleChange}
	    					style={	
								this.state.style
	    					}
	    					disabled={this.state.disabled}
						/>
						<FormControl.Feedback />
					</FormGroup>
				</form>
			</Well>
		);
    }
});

module.exports = TranslationNotesComponent;
