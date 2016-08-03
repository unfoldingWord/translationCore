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
var Nav = require('../NavigationMenu.js');
var currentcounter = 0;
var totalCheck = 100;

var Progress = React.createClass({

  getInitialState: function() {
    return {
      progress:0,
      checkObj: [],
      warning:0,
      success:0,
      percent: "",
      currentCheck: "",
      max: 0,
      showModal: false
    };
  },

  componentWillMount: function() {
    CoreStore.addChangeListener(this.updateModuleProgress);
    CheckStore.addEventListener('changedCheckStatus', this.updateModuleProgress);
  },

  beautifyString: function(check) {
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


  componentWillUnMount: function() {
    CoreStore.removeChangeListener(this.updateModuleProgress);
  },

  updateModuleProgress: function(data) {
    if (data)
    {

      var listOfChecks = api.getDataFromCommon("arrayOfChecks");
      // for (var i in listOfChecks) {
      //   listOfChecks[i].name = this.beautifyString(listOfChecks[i].name);
      // }
      console.log(listOfChecks);
      var _this = this;
      this.setState({showModal: CoreStore.getModProg()})
      if (CoreStore.getModProg() === true) {
        _this.updateBar(data);
        _this.ModuleProgressBar();
      }
    }
  },

  updateBar: function(status) {
    var modName = CoreStore.getCurrentCheckCategory();
    this.totalCheck = CheckStore.getModuleDataObject(modName.name);
    this.totalCheck = this.totalCheck.groups.length;
    this.setState({max: this.totalCheck});
    var temp = this.state.progress;
    try {
      if ((status.checkStatus) && temp<=this.totalCheck) {
        var objectIndex = status.groupIndex.toString() + status.checkIndex.toString();
        if (this.compare(this.checkObj, objectIndex)) {
          this.currentcounter = this.currentcounter + 1;
          var tempobject = objectIndex;
          this.setState({checkObj: objectIndex});
        }
      }
    }
    catch(e) {
    }
  },

  ModuleProgressBar: function() {
    if (CoreStore.getCurrentCheckCategory() === null) {
      dialog.showErrorBox("Module not yet created");
    }
    else {
      var temp = CoreStore.getCurrentCheckCategory();
      this.setState({currentCheck: temp.name});

      // for (var i in list) {
      //   var index = temp.name.search(list[i].name);
      //   if (index != -1) {
      //     console.log("found it");
      //   }
      // }

      var bar = this.currentcounter/this.totalCheck;
      this.setState({progress: bar});
      console.log(bar);
      var per = bar.toString() + "%";
      this.setState({percent: per});
      console.log(per);
    }
  },

  compare: function(index, key) {
    for (var i in index.length) {
      if (index[i] !== key) {
        return true;
      }
    }
    return false;
  },

  render: function() {
    var displayElement = [];
    if (CoreStore.getModProg()) {
      displayElement = [<ProgressBar striped key={1} bsStyle="success" now={this.state.progress} max={this.state.max} label={this.state.percent}/>
  ]
} else {
  displayElement = [<ProgressBar key={1} label={this.state.percent}/>]
}
return(
  <div style={style.container} max-width={"1000px"} margin={"auto"}>
    <div>{this.state.currentCheck}</div>
    <ProgressBar max-width={"500px"} margin={"auto"}>
      {displayElement}
    </ProgressBar>
  </div>
);
}

});

module.exports = Progress;
