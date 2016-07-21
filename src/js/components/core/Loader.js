const React = require('react');
const CoreStore = require('../../stores/CoreStore.js');
const ProgressBar = require('react-bootstrap/lib/ProgressBar.js');
const Modal = require('react-bootstrap/lib/Modal.js');
var progressStack = [];
var currentProgress = 0;

const Loader = React.createClass({
  getInitialState: function() {
    return {
      progress:0,
      showModal:false
    };
  },
  componentWillMount: function() {
    CoreStore.addChangeListener(this.sendProgressForKey);
  },
  sendProgressForKey: function(){
    var progressArray = CoreStore.getProgress();
    if (progressArray && currentProgress != 0) {
      var progressKey = progressArray[0];
      var specificProgressForKey = progressArray[1];
      var elementIndex = progressStack[progressKey];
      if ( elementIndex == undefined){
        progressStack[progressKey] = specificProgressForKey;
      } else {
        var overallProgress = Object.keys(progressStack).length * 100;
        for (var progressElement in progressStack) {
          currentProgress += progressStack[progressElement];
        }
        this.setState({
          progress: currentProgress,
          showModal: true
        });
      }
    } else {
      currentProgress = 0;
      progressStack = [];
      this.setState({
        progress: 0,
        showModal: false
      });
    }
  },

  handleClick: function(e) {
  },
  render: function() {
    return (
      <div>
      <Modal show={this.state.showModal} onHide={this.handleClick} onClick={this.handleClick}>
      <ProgressBar now={this.state.progress} style={{top:'50vh', left: '50vw'}}/>
      </Modal>
      </div>
    );
  }
});

module.exports = Loader;
