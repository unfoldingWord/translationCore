var React = require('react');
var remote = window.electron.remote;
var {dialog} = remote;
var path = require('path');
var ProgressBar = require('react-bootstrap/lib/ProgressBar');
var Collapse = require('react-bootstrap/lib/Collapse');
var style = require('./ProgressStyle.js');
var api = window.ModuleApi;
var CoreStore = require('../../../stores/CoreStore.js');
var CheckStore = require('../../../stores/CheckStore.js');

var Progress = React.createClass({
  getInitialState: function () {
    return {
      data: {},
      label: "",
      progress: 0,
      max: 0
    };
  },

  componentWillMount: function () {
        CoreStore.addChangeListener(this.updateModuleProgress);
        CheckStore.addEventListener('changedCheckStatus', this.emitProgress);
  },


  emitProgress(viewObj) {
    var indexArrays = [];
    if (this.state.data != {}) {
      for (var element in viewObj) {
        var stringRegex = new RegExp("index", "i");
        var val = stringRegex.test(element);
        if (val) {
          indexArrays.push(element);
        }
      }
      this.updateModuleProgress(viewObj, indexArrays);
    }

  },

  beautifyString: function (check) {
    var stringRegex = new RegExp("[^a-zA-Z0-9\s]", "g");
    let regRes;
    try {
      check = check.replace(stringRegex, " ");
    }
    catch (e) {
    }
    completeWord = [];
    check = check.split(" ");
    for (var word of check) {
      word = word.charAt(0).toUpperCase() + word.slice(1);
      completeWord.push(word);
    }
    completeWord = completeWord[0] + completeWord[1];
    return completeWord;
  },


  componentWillUnMount: function () {
    CoreStore.removeChangeListener(this.updateModuleProgress);
  },

  updateModuleProgress: function (data, indexArrays) {
    if (data) {
      var modName = CoreStore.getCurrentCheckCategory();
      var viewObj = CheckStore.getModuleDataObject(modName.name);
      var total = viewObj.groups.length;
      var valIndex = [];
      for (var element of indexArrays) {
        valIndex.push(data[element]);
      }
      var tempData = this.state.data;
	    var currentName = modName.name;
      if (tempData[currentName] == undefined) {
         tempData[currentName]  = {};
      }
      if (this.state.max == 0) {
        this.setState({
          max: total,
          label: currentName,
          data: tempData
        });
      }
      var show = CoreStore.getModProg();
      this.setState({
        showModal: show
      });
      if (show) {
        this.updateBar(data, modName.name, valIndex);
      }
    }
  },

  updateBar: function (data, name, index) {
    var currentProgress = this.state.progress;
    if (this.isNewData(name, index)) {
      this.addToProgress();
    }
  },

  isNewData: function (name, index) {
    var progressObj = this.state.data;
    if (!progressObj[name][index]) {
      progressObj[name][index] = 1;
      this.setState({
        data: progressObj
      });
      return true;
    } else {
      return false;
    }
  },

  addToProgress: function () {
    var currentProgress = this.state.progress;
    var total = this.state.max;
    currentProgress += 1;
    this.setState({
      progress: currentProgress
    });
  },

  render: function () {
    return (
      <div style={style.container} max-width={"1000px"} margin={"auto"}>
        <ProgressBar striped key={2} bsStyle="warning" now={this.state.progress} max={this.state.max} label={this.state.label}/>
      </div>
    );
  }

});

module.exports = Progress;
