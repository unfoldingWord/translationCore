/**
 * @author Ian Hoegen
 * @description: This is the modal for the drag and drop upload feature.
 ******************************************************************************/
const React = require('react');

const Button = require('react-bootstrap/lib/Button.js');
const Modal = require('react-bootstrap/lib/Modal.js');

const CoreStore = require('../stores/CoreStore.js');

const FileUpload = require('./FileUpload');

const UploadModal = React.createClass({
  componentWillMount: function() {
    CoreStore.addChangeListener(this.updateModal);
  },
  updateModal: function() {
    this.setState({showModal: CoreStore.getModal()});
  },
  getInitialState: function() {
    return {showModal: false};
  },
  close: function() {
    this.setState({showModal: false});
  },

  open: function() {
    this.setState({showModal: true});
  },

  render: function() {
    return (
      <div>
        <Modal show={this.state.showModal} onHide={this.close}>
          <Modal.Header closeButton>
            <Modal.Title>Import Project</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <FileUpload />
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.close}>Close</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
});

module.exports = UploadModal;
