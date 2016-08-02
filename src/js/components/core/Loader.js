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
    CoreStore.addChangeListener(this.update);
  },

  componentWillUnMount: function() {
    CoreStore.removeChangeListener(this.update);
  },

  update: function() {
    this.setState({
      progress: CoreStore.getProgress(),
      showModal: CoreStore.loaderModalVisibility
    });
  },

  getCurrentProgress: function(){
    var progressKey = CoreStore.getProgress();
    if (progressKey){
      // var progressKey = progressArray[0];

      return currentProgress;
    }
    else {
      return 0;
    }
  },
    

  handleClick: function(e) {
  },
  render: function() {
    return (
      <div>
        <Modal show={this.state.showModal} onHide={this.handleClick} onClick={this.handleClick}>
          <ProgressBar striped active now={this.state.progress} style={{top:'50vh', left: '50vw'}}/>
          <img src="images/TC_ANIMATED_Logo.gif"/>
        </Modal>
      </div>
    );
  }
});

module.exports = Loader;
