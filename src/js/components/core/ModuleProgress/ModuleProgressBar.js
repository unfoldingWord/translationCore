var React = require('react');
var remote = window.electron.remote;
var {dialog} = remote;
var path = require('path');
var ProgressBar = require('react-bootstrap/lib/ProgressBar');
var Collapse = require('react-bootstrap/lib/Collapse');
var SwitchCheckModuleDropdown = require('../SwitchCheckModuleDropdown.js');
var style = require('./ProgressStyle.js');
var api = window.ModuleApi;
var CoreStore = require('../../../stores/CoreStore.js');

var Progress = React.createClass({
  getInitialState: function() {
    return {
      lexicalGroups:0,
      lexicalWordList:0,
      lexicalProgress:0,
      phraseblah:0,
      phraseblah2:0,
      showModal: false
    };
  },

  componentWillMount: function() {
    CoreStore.addChangeListener(this.updateModuleProgress);
  },

  componentWillUnMount: function() {
    CoreStore.removeChangeListener(this.updateModuleProgress);
  },

  updateModuleProgress: function() {
    var _this = this;
    console.log(CoreStore.getModProg());
    this.setState({showModal: CoreStore.getModProg()})
    if (CoreStore.getModProg() === true) {
      _this.ModuleProgressBar();
    }
  },

  ModuleProgressBar: function() {
    var viewObj = require(window.__base + path + '/View');
    if (api.getModule(viewObj.name) === null) {
      console.log("Module not yet created");
    }
    else {
        var selectedModule = viewObj.name;
        console.log("Current Module being used");
        console.log(selectedModule);
        if (selectedModule == "Lexical Checker") {
          console.log("Module object of checks and type of lexical checker");
          var currentlexicalgroupobj = api.getDataFromCheckStore("LexicalChecker","groups");
          console.log(currentlexicalgroupobj);
          var currentlexicalwordobj = api.getDataFromCheckStore("LexicalChecker", "wordList");
          console.log(currentlexicalwordobj);
        }
        else if (selectedModule == "Phrase Checker") {
          console.log("Module object of checks and type of phrase checker");
          var currentphrasewordobj = api.getDataFromCheckStore("PhraseChecker", "groups");
          console.log(currentphrasewordobj);
        }
    }
  },

//TODO: use GetModule from ModuleApi
//TODO: use ModuleApi getDataFromCheckStore using params from FetchData for all possible checks
//TODO: use ReportView possibly for reported checks
//TODO: Lexical and Phrase do stacked


render: function() {
  var content;
  if (CoreStore.getModProg()) {
      content =
      (<div>
          <div>Phrase Check Module Progress</div>
          <ProgressBar max-width={"500px"} margin={"auto"}>
            <ProgressBar striped key={1} bsStyle="success" now={35} label="35%"/>
            <ProgressBar striped key={2} bsStyle="info" now={60} label="60%"/>
          </ProgressBar>
        <div>Lexical Check Module Progress</div>
          <ProgressBar max-width={"500px"} margin={"auto"}>
            <ProgressBar striped key={1} bsStyle="success" now={35} label="35%"/>
            <ProgressBar striped key={2} bsStyle="info" now={20} label="20%"/>
            <ProgressBar striped key={3} bsStyle="danger" now={20} label="20%"/>
          </ProgressBar>
        </div>);
  }
  else {
    content = null;
  }
  return(
    <div style={style.container} max-width={"1000px"} margin={"auto"}>
      {content}
    </div>

  );
}

});

module.exports = Progress;
