/**
 * @author Ian Hoegen
 * @description: This is the modal for the drag and drop upload feature.
 ******************************************************************************/
const FileUpload = require('./fileupload');
const React = require('react');
const Modal = require('react-bootstrap/lib/Modal.js');
const Button = require('react-bootstrap/lib/Button.js');
const FileActions = require('./FileActions');
const UploadModal = React.createClass({
  componentWillMount: function() {
    FileActions.on('upload', this.userChoice);
  },
  getInitialState: function() {
    return {showModal: false};
  },
  userChoice: function(boolean) {
    this.setState({showModal: boolean});
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
