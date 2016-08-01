const React = require('react');
const CoreStore = require('../../stores/CoreStore.js');
const ProgressBar = require('react-bootstrap/lib/ProgressBar.js');
const Modal = require('react-bootstrap/lib/Modal.js');
var progressStack = [];

const CheckStore = require('../../stores/CheckStore.js');

const Loader = React.createClass({
  progressObject: {},

  getInitialState: function() {

    return {
      progress:0,
      showModal:false
    };
  },
  componentWillMount: function() {
    CoreStore.addChangeListener(this.sendProgressForKey);
    CoreStore.addChangeListener(this.finishLoader);
  },

  componentWillUnMount: function() {
    CoreStore.removeChangeListener(this.sendProgressForKey);
    CoreStore.removeChangeListener(this.finishLoader);
  },

  finishLoader: function() {
    if (CoreStore.doneLoading) {
      //console.log('CheckStore');
      //console.dir(CheckStore);
      this.setState({
        progess: 100,
        showModal: false
      });
    }
  },

  sendProgressForKey: function(){
    var progressKey = CoreStore.getProgress();
    if (progressKey){
      // var progressKey = progressArray[0];

      this.progressObject[progressKey.key] = progressKey.progress
      var currentProgress = 0;
      for (var key in this.progressObject){
        currentProgress += this.progressObject[key];
      }
      var number = CoreStore.getNumberOfFetchDatas();
      currentProgress = currentProgress / number;
      this.setState({
        progress: currentProgress,
        showModal: true
      });
    }
  },

  handleClick: function(e) {
  },
  render: function() {
    return (
      <div>
        <Modal show={this.state.showModal} onHide={this.handleClick} onClick={this.handleClick}>
          <ProgressBar striped active now={this.state.progress} style={{top:'50vh', left: '50vw'}/>
          <img src="images/TC_ANIMATED_Logo.gif"/>
        </Modal>
      </div>
    );
  }
});

module.exports = Loader;
