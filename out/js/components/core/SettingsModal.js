/**
 * @author Ian Hoegen
 * @description: This is the modal for the drag and drop upload feature.
 ******************************************************************************/
const React = require('react');

const Button = require('react-bootstrap/lib/Button.js');
const Modal = require('react-bootstrap/lib/Modal.js');

const CoreStore = require('../../stores/CoreStore.js');
const CoreActions = require('../../actions/CoreActions.js');

const SettingsModal = React.createClass({
  displayName: 'SettingsModal',

  getInitialState: function () {
    return { showModal: false };
  },
  componentWillMount: function () {
    CoreStore.addChangeListener(this.updateModal);
  },
  componentWillUnmount: function () {
    CoreStore.removeChangeListener(this.updateModal);
  },
  updateModal: function () {
    this.setState({ showModal: CoreStore.getSettingsView() });
  },
  close: function () {
    CoreActions.updateSettings(false);
  },

  render: function () {
    return React.createElement(
      'div',
      null,
      React.createElement(
        Modal,
        { show: this.state.showModal, onHide: this.close },
        React.createElement(
          Modal.Header,
          { closeButton: true },
          React.createElement(
            Modal.Title,
            null,
            'Settings'
          )
        ),
        React.createElement(
          Modal.Body,
          null,
          React.createElement(
            'h3',
            null,
            'Settings Page '
          )
        ),
        React.createElement(
          Modal.Footer,
          null,
          React.createElement(
            Button,
            { onClick: this.close },
            'Close'
          )
        )
      )
    );
  }
});

module.exports = SettingsModal;