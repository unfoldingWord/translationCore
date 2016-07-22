const React = require('react');
const FormGroup = require('react-bootstrap/lib/FormGroup.js');
const FormControl = require('react-bootstrap/lib/FormControl.js');
const Button = require('react-bootstrap/lib/Button.js');
const Modal = require('react-bootstrap/lib/Modal.js');
const ControlLabel = require('react-bootstrap/lib/ControlLabel.js');
const ButtonToolbar = require('react-bootstrap/lib/ButtonToolbar.js');
const remote = window.electron.remote;
const ENTER = 13;
const path = require('path');
const {dialog} = remote;

const bookMap = require('../BooksOfBible');

const projectname = React.createClass({
  getInitialState: function() {
    return {
      projectname:this.props.projectname,
      saveLocation: null,
      bookName: null
    }
  },
  allFieldsEntered: function() {
    tempBookName = this.state.projectname;
    if (this.getBookAbbr(tempBookName)) {
      this.setState({
        bookName: e.target.value
      });
    } else {
      alert("Book Name: " + tempBookName + " Is Invlaid.");
    }
    if(!this.state.projectname || !this.state.saveLocation || !this.state.bookName) {
      return false;
    } else {
      return true;
    }
  },
  setprojectname: function (e) {
    var newName = e.target.value;
    this.setState({
      projectname: newName
    });
    if (e.charCode == ENTER) {
    }
  },
  sendBackSaveLocation: function() {
    var _this = this;
    dialog.showOpenDialog({
      properties: ['openDirectory']
    }, function(filename) {
      if (filename !== undefined) {
        // FileImport(filename[0]);
        if (!_this.state.projectname){
          alert("Enter All Fields");
          return;
        }
        _this.setState({saveLocation: path.join(filename[0], _this.state.projectname)});
        _this.props.passBack(path.join(filename[0], _this.state.projectname));
      }

    });
  },

  setBookName: function(e) {
    tempBookName = e.target.value;
    if (this.getBookAbbr(tempBookName)) {
      this.setState({
        bookName: e.target.value
      });
    } else {
      alert("Book Name: " + tempBookName + " Is Invlaid.");
    }
  },

  getBookName: function() {
    if (!this.state.bookName) {
      console.error("We can't find the value for the book abbr!");
    }
    else {
      var bookName = this.state.bookName;
      var bookAbbr = this.getBookAbbr(bookName);
      if (bookAbbr) {
        return bookAbbr;
      }
    }
  },

  getBookAbbr: function(bookName) {
    for (var key in bookMap) {
      if (bookName.toLowerCase() == bookMap[key].toLowerCase() || bookName.toLowerCase() == key) {
        return key;
      }
    }
    return null;
  },

  render: function() {
    return (
      <div>
      <Modal.Header>
      <Modal.Title>{this.props.modalTitle}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
      <FormGroup>
      <ControlLabel>Enter Project Name</ControlLabel>
      <FormControl type="text" placeholder={"John Wycliffe"} onChange={this.setprojectname} />
      </FormGroup>
      <FormGroup>
      <ControlLabel>Enter Book Name</ControlLabel>
      <FormControl type="text" placeholder={"2 Timothy"} onChange={this.setBookName} />
      </FormGroup>
      <div>
      <Button onClick={this.sendBackSaveLocation}>Choose Save Location</Button>
      <ControlLabel>{this.state.saveLocation}</ControlLabel>

      </div>
      </Modal.Body>
      </div>
    )}
  });
  module.exports = projectname;
