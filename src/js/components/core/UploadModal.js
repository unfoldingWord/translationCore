/**
 * @author Ian Hoegen
 * @description: This is the modal for the drag and drop upload feature.
 ******************************************************************************/
const React = require('react');

const Button = require('react-bootstrap/lib/Button.js');
const Nav = require('react-bootstrap/lib/Nav.js');
const NavItem = require('react-bootstrap/lib/NavItem.js');
const Modal = require('react-bootstrap/lib/Modal.js');

const CoreStore = require('../../stores/CoreStore.js');
const CoreActions = require('../../actions/CoreActions.js');

const OnlineInput = require('./OnlineInput');
const FileUpload = require('./FileUpload');

const UploadModal = React.createClass({
  componentWillMount: function() {
    CoreStore.addChangeListener(this.updateModal);
  },
  updateModal: function() {
    this.setState({showModal: CoreStore.getModal()});
  },
  getInitialState: function() {
    return {showModal: false, active: 1, showFile: true};
  },
  close: function() {
    CoreActions.updateModal(false);
  },
  open: function() {
    this.setState({showModal: true});
  },
  handleSelect: function(eventKey) {
    this.setState({active: eventKey});
    if (eventKey === 1) {
      this.setState({showFile: true});
    } else {
      this.setState({showFile: false});
    }
  },
  render: function() {
    var mainContent;
    if (this.state.showFile === true) {
      mainContent = <FileUpload />;
    } else {
      mainContent = (<div>
                       <br />
                       <OnlineInput />
                     </div>);
    }
    return (
        <Modal show={this.state.showModal} onHide={this.close}>
          <Modal.Header closeButton>
            <Modal.Title>Import Project</Modal.Title>
          </Modal.Header>
          <Modal.Body>
          <Nav bsStyle="tabs" activeKey={this.state.active} onSelect={this.handleSelect}>
            <NavItem eventKey={1}>Import Project Locally</NavItem>
            <NavItem eventKey={2}>Import From Online</NavItem>
          </Nav>
          {mainContent}
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.close}>Close</Button>
          </Modal.Footer>
        </Modal>
    );
  }
});

module.exports = UploadModal;
