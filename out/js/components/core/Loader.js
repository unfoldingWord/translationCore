const React = require('react');
const CoreStore = require('../../stores/CoreStore.js');
const ProgressBar = require('react-bootstrap/lib/ProgressBar.js');
const Modal = require('react-bootstrap/lib/Modal.js');
var progressStack = [];

const CheckStore = require('../../stores/CheckStore.js');

const Loader = React.createClass({
  displayName: 'Loader',

  progressObject: {},

  getInitialState: function () {

    return {
      progress: 0,
      showModal: false
    };

    this.update = this.update.bind(this);
  },

  componentWillMount: function () {
    CoreStore.addChangeListener(this.update);
  },

  componentWillUnmount: function () {
    CoreStore.removeChangeListener(this.update);
  },

  update: function () {
    this.setState({
      progress: CoreStore.getProgress(),
      showModal: !CoreStore.doneLoading
    });
  },

  render: function () {
    return React.createElement(
      'div',
      null,
      React.createElement(
        Modal,
        { show: this.state.showModal },
        React.createElement(ProgressBar, { striped: true, active: true, now: this.state.progress, style: { top: '50vh', left: '50vw' } }),
        React.createElement(
          'center',
          null,
          React.createElement('img', { src: 'images/TC_ANIMATED_Logo.gif' })
        )
      )
    );
  }
});

module.exports = Loader;