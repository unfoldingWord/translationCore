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
  getInitialState: function() {
    return {showModal: false};
  },
  componentWillMount: function() {
    CoreStore.addChangeListener(this.updateModal);
  },
  componentWillUnmount: function() {
    CoreStore.removeChangeListener(this.updateModal);
  },
  updateModal: function() {
    this.setState({showModal: CoreStore.getSettingsView()});
  },
  close: function() {
    CoreActions.updateSettings(false);
  },

  render: function() {
    return (
      <div>
        <Modal show={this.state.showModal} onHide={this.close}>
          <Modal.Header closeButton>
            <Modal.Title>Settings</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h3>Settings Page </h3>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.close}>Close</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
});

module.exports = SettingsModal;
