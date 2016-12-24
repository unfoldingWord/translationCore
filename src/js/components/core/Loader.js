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

    this.update = this.update.bind(this);
  },

  componentWillMount: function() {
    CoreStore.addChangeListener(this.update);
  },

  componentWillUnmount: function() {
    CoreStore.removeChangeListener(this.update);
  },

  update: function() {
    debugger;
    this.setState({
      progress: CoreStore.getProgress(),
      showModal: !CoreStore.doneLoading
    });
  },

  render: function() {
    return (
      <div>
        <Modal show={this.state.showModal}>
          <ProgressBar striped active now={this.state.progress} style={{top:'50vh', left: '50vw'}}/>
          <center><img src="images/TC_ANIMATED_Logo.gif"/></center>
        </Modal>
      </div>
    );
  }
});

module.exports = Loader;
