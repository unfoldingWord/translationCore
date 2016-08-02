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
const DragDrop = require('./DragDrop');

const IMPORT_PROJECT = 'Import Translation Studio Project';
const IMPORT_LOCAL = 'Import Project Locally';
const IMPORT_ONLINE = 'Import From Online';

const UploadModal = React.createClass({
  getInitialState: function() {
    return {active: 1, showFile: false};
  },
  handleSelect: function(eventKey) {
    this.setState({active: eventKey});
    if (eventKey === 1) {
      this.setState({showFile: false});
    } else {
      this.setState({showFile: true});
    }
  },

  sendFilePath: function(path, link, flag) {
    if (this.props.setTargetLanguageFilePath) {
      this.props.setTargetLanguageFilePath(path, link, flag);
    } else {
      console.error("Can't find setTargetLanguageFilePath!");
    }
  },

  render: function() {
    var mainContent;
    if (this.state.showFile === true) {
      mainContent = <DragDrop
                      sendFilePath={this.sendFilePath}
                    />;
    } else {
      mainContent = (<div>
                       <br />
                       <OnlineInput sendFilePath={this.sendFilePath}/>
                     </div>);
    }
    return (
          <div>
            <Modal.Header>
              <Modal.Title>{IMPORT_PROJECT}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <Nav bsStyle="tabs" activeKey={this.state.active} onSelect={this.handleSelect}>
              <NavItem eventKey={1}>{IMPORT_ONLINE}</NavItem>
              <NavItem eventKey={2}>{IMPORT_LOCAL}</NavItem>
            </Nav>
            {mainContent}
            </Modal.Body>
          </div>
    );
  }
});

module.exports = UploadModal;
