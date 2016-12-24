var React = require('react');
var remote = require('electron').remote;
var {dialog} = remote;
var path = require('path');
var ProgressBar = require('react-bootstrap/lib/ProgressBar');
var Collapse = require('react-bootstrap/lib/Collapse');
var api = window.ModuleApi;
var CoreStore = require('../../../stores/CoreStore.js');
var CheckStore = require('../../../stores/CheckStore.js');

var Progress = React.createClass({
  getInitialState: function () {
    return {
      style: {
        minHeight: "50px",
        backgroundColor: "dark-grey",
        display:'none'
      },
      label: "",
      progress: 0,
      max: 0
    };
  },

  componentWillMount: function () {
    CoreStore.addChangeListener(this.showProgress);
    CheckStore.addEventListener('changedCheckStatus', this.updateProgress);
    CheckStore.addEventListener('changeCheckType', this.updateProgress);
  },

  componentWillUnMount: function () {
    CoreStore.removeChangeListener(this.showProgress);
    CheckStore.removeEventListener('changedCheckStatus', this.updateProgress);
    CheckStore.removeEventListener('changeCheckType', this.updateProgress);
  },

  showProgress() {
    var show = CoreStore.getModProg();
    if (show) {
      this.setState({
        style: {
        minHeight: "50px",
        backgroundColor: "dark-grey",
        display:'inline'
      }
      });
    } else {
      this.setState({
        style: {
        minHeight: "50px",
        backgroundColor: "dark-grey",
        display:'none'
      }
    });
  }
  },


  updateProgress(data) {
    var _this = this;
    if (data.checkIndex != null || data.currentCheckNamespace != null) {
      var name = CoreStore.currentCheckNamespace;
      var viewObj = CheckStore.getModuleDataObject(name);
      this.getChecked(viewObj, function (totalChecked, total) {
        _this.setState({
          progress: totalChecked,
          max: total,
          label: name
        });
      });
    } else {
        CoreStore.modProgressView = false;
        this.showProgress();
    }
  },

  getChecked(viewObj, callback) {
    var totalChecked = 0;
    var total = 0;
    for (var group in viewObj['groups']) {
      for (var check in viewObj['groups'][group]['checks']) {
        var checkStatus = viewObj['groups'][group]['checks'][check]["checkStatus"];
        if ( checkStatus != "UNCHECKED" && checkStatus != "NOT_CHECKED") {
          totalChecked += 1;
        }
        total += 1;
      }
    }
    callback(totalChecked, total);
  },

  render: function () {
    return (
      <div style={this.state.style} max-width={"1000px"} margin={"auto"}>
        <ProgressBar striped bsStyle="warning" now={this.state.progress} max={this.state.max} label={this.state.label}/>
      </div>
    );
  }

});

module.exports = Progress;
