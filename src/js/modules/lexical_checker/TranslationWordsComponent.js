
//TranslationWords

var React = require('react');
var ReactDOM = require('react-dom');

var TranslationNotesHTMLScraper = require('./HTMLScraper.js');

//Bootstrap for dayz
var FormGroup = require('react-bootstrap/lib/FormGroup.js');
var FormControl = require('react-bootstrap/lib/FormControl.js');
var ControlLabel = require('react-bootstrap/lib/ControlLabel.js');
var Well = require('react-bootstrap/lib/Well.js');
var Button = require('react-bootstrap/lib/Button.js');
var Glyphicon = require('react-bootstrap/lib/Glyphicon.js');
var ButtonGroup = require('react-bootstrap/lib/ButtonGroup.js');
var Modal = require('react-bootstrap/lib/Modal.js');
var HelpBlock = require('react-bootstrap/lib/HelpBlock.js');

//hardcoded english constants
var BOOK_QUERY = 'Type in Book Name',
    BOOK_EXAMPLE = 'Ex: "Ephesians"',
    DOWNLOAD_BOOK = "Download Book",
    UPLOAD_FROM_COMPUTER = "Retrieve Book",
    SAVE_TO_COMPUTER = "Save Book",
    QUERYING_BOOKS = "Retrieving information",
    DISCONNECTED_TITLE = "Disconnected From Internet",
    DISCONNECTED_MESSAGE = "Failed to retrieve a list of books from: ",
    CLOSE = "Close",
    UPLOAD_FILE = "Upload File",
    JSON_SPECIFIER = "Accepts .JSON files";

var TranslationWordsComponent = React.createClass({
    //this requires the internet, which at some point there needs to be a way to get the information
    //from local storage
    tNHtmlScraper: new TranslationNotesHTMLScraper(),
    
    bookAbbreviations: null,

    getInitialState: function() {
	return {
	    showErrorModal: true
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
	    function() {
		this.setState({showErrorModal: true});
	    }
	);
    },

    closeErrorModal: function() {
	if (this.state.showErrorModal) {
	    this.setState({showErrorModal: false});
	}
    },

    getUploadFile: function() {
    },
    
    render: function() {
	var _this = this;
	
	var UploadButton = React.createClass({

	    render: function() {
		return (
			<Button
		    onClick={this.getUploadFile}
			>
			
			<Glyphicon
		    glyph='upload'
			/>
			<span>{' ' + UPLOAD_FROM_COMPUTER}
		    </span>
			</Button>
		);		
	    }
	});
	if (true) {
	    return (
		    <UploadForm />
	    );
	}
	else {
	    return (
		<div>
		
		<Modal show={this.state.showErrorModal} onHide={this.closeErrorModal}>
		<Modal.Header closeButton>
		<Modal.Title>
		<span>
		<Glyphicon
	    glyph='alert'
	    style={{
		color: 'orange'
	    }}
		/>
		{' ' + DISCONNECTED_TITLE}
	    </span>
		</Modal.Title>
		</Modal.Header>
		<Modal.Body>
		{DISCONNECTED_MESSAGE + this.tNHtmlScraper.getBaseLink()}
	    </Modal.Body>
		<Modal.Footer>
		<UploadButton />
		<Button
	    onClick={this.closeErrorModal}
		>
		{CLOSE}
	    </Button>
		</Modal.Footer>
		</Modal>		
		<BookForm
	    validateBook = {this.validateBook}
	    ref = {'BookForm'}
		/>
		<br />
		<ButtonGroup>
		<UploadButton />
		<Button
	    onClick = {this.getBook}
		>
		<Glyphicon
	    glyph='download'
		/>
		<span>{' ' + DOWNLOAD_BOOK}
	    </span>
		</Button>
		</ButtonGroup>
		</div>
	    );
	}
    },

    validateBook: function(str) {
	if (!this.bookAbbreviations) { /* this is hacky, it will show a warning
					  even if the user has typed in a valid 
					  book before we've gotten the book names
					  from the gogs server using the HTML scraper
				       */
	    return 'warning';
	}
	if (str in this.bookAbbreviations) {	    
	    return 'success';
	}
	else {
	    return 'error';
	}
    }
});

var Input = require('react-bootstrap/lib/Input.js');

//UploadForm
var UploadForm = React.createClass({

    uploadFile: function() {
	console.log(ReactDOM.findDOMNode(this.refs.fileUpload).files[0]); /* this is the only way I could find
									     to do this without react giving 
									     me a bunch of errors
									  */
	//console.log(this.refs.fileUpload.getInputDOMNode().files[0]);
    },
    
    render: function() {
	return (
		<span>
		<Well
	    bsSize="sm"
		>
		<FormControl
	    type={'file'}
	    accept={'.json'}
	    ref={'fileUpload'}
		/>
		<HelpBlock>{JSON_SPECIFIER}</HelpBlock>
		<Button
	    onClick={this.uploadFile}
		>
		{UPLOAD_FILE}
	    </Button>
		</Well>
		</span>
	);
    },

    
});

//BookForm
var BookForm = React.createClass({
    
    getInitialState: function() {
	return {
	    value: '',
	    placeHolder: QUERYING_BOOKS,
	    style: {
		cursor: 'wait'
	    }
	};
    },

    getValidationState: function() {
	var value = this.state.value;
	return this.props.validateBook(value);
    },

    handleChange: function(event) {
	this.setState({
	    value: event.target.value
	});	
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
    
    render: function() {
	return (
		<Well
		bsSize="sm">
		<form>
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
		/>
		<FormControl.Feedback />
		</FormGroup>
		</form>
		</Well>
	);
    }
});

ReactDOM.render( <TranslationWordsComponent />,
		 document.getElementById('content') );
