const React = require('react');
const fs = require(window.__base + 'node_modules/fs-extra');
const FormGroup = require('react-bootstrap/lib/FormGroup.js');
const FormControl = require('react-bootstrap/lib/FormControl.js');
const Button = require('react-bootstrap/lib/Button.js');
const Modal = require('react-bootstrap/lib/Modal.js');
const FileModule = require('../FileModule');
const ControlLabel = require('react-bootstrap/lib/ControlLabel.js');
const ButtonToolbar = require('react-bootstrap/lib/ButtonToolbar.js');
const Checkbox = require('react-bootstrap/lib/Checkbox.js');
const ENTER = 13;
const remote = window.electron.remote;
const {dialog} = remote;

const SelectChecks = React.createClass({
  getInitialState: function() {
    return {
    loadedChecks: this.props.loadedChecks,
    currentChecks: this.props.currentChecks,
    allModules:[],
    FetchDataArray:this.props.FetchDataArray
  }
  },
  componentWillMount: function() {
    var modules = this.getChecksFromFilesystem();
    this.setState({
      allModules:modules
    });
  },
  getChecksFromFilesystem: function(){
    var modules = [];
    var allModules = [];
    try {
      var file = fs.readdirSync(window.__base + '/modules');
      for (var element of file) {
        if (this.isModule((window.__base + '/modules/' + element), element)) {
          modules.push(element);
        }
      }
      modules = this.state.loadedChecks.concat(modules);
      return modules;
      } catch (e) {
      console.log(e);
    }
  },
  selectedModule: function(element) {
    var elementIndex = this.state.FetchDataArray.indexOf(element);
    if ( elementIndex == -1){
      this.state.FetchDataArray.push(element);
    } else {
      this.state.FetchDataArray.splice(elementIndex, 1);
    }
  },
  beautifyString: function(check) {
    const stringRegex = new RegExp("[^a-zA-Z0-9\s]", "g");
    let regRes;
    try {
      check = check.replace(stringRegex, " ");
    }
    catch (e) {
    }
    completeWord = [];
    check = check.split(" ");
    for (var word of check) {
      word = word.charAt(0).toUpperCase() + word.slice(1) + " ";
      completeWord.push(word);
    }
    return completeWord;
  },
  isModule: function(filepath, file){
    try {
      var stats = fs.lstatSync(filepath);
      if (stats.isDirectory()) {
      }
      else {
        return false;
      }
      try {
        fs.accessSync(filepath + '/FetchData.js');
        return true;
      } catch (e) {
        console.log(e);
      }
    }
    catch (e) {
      console.log(e);
      return false;
    }
  },
  getModule: function() {
    dialog.showOpenDialog({
      properties: ['openDirectory']
    }, function(filename) {
      if (filename !== undefined) {
        this.addMoreModules(filename);
      }
    });
  },
  addMoreModules: function(filename) {
    try {
      FileModule.readFile(file, readFile);
      console.log(readFile);
    } catch (error) {
      dialog.showErrorBox('Import Error', 'Check Selected Module.');
      console.log(error);
    }
    var filename = this.getModule();
    var newModule = filename[0].split('/').pop();
    //this.("Check", newModule);
  },
  makePathForChecks: function(check) {
    var path = window.__base + 'modules/' + check;
    return path;
  },
  render: function() {
    var i = 0;
    var checkButtonComponents = this.state.allModules.map((allModules) => {
      return (
        <div key={i++}>
        <Checkbox id={this.state.allModules}>
        {this.beautifyString(allModules)}
        </Checkbox>
        </div>
      )
    });
    return (
      <div>
      <Modal.Header>
      <Modal.Title>
      Select Checks
      </Modal.Title>
      </Modal.Header>
      <Modal.Body>
      <FormGroup onClick={this.selectedModule}>
      {checkButtonComponents}
      <ButtonToolbar>
      <Button bsSize="xsmall" onClick={this.addMoreModules}>Add Modules</Button>
      </ButtonToolbar>
      </FormGroup>
      </Modal.Body>
      </div>
    )
  }
});
module.exports = SelectChecks;
