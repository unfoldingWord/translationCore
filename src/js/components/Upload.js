/**
 * @author Ian Hoegen
 * @description: This is the modal for the drag and drop upload feature.
 ******************************************************************************/
import React from 'react';
import PropTypes from 'prop-types';
import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';

const IMPORT_LOCAL = 'Import From Local Project';
const IMPORT_ONLINE = 'Import From Online';
const IMPORT_USFM = 'Import From Local USFM File';
const IMPORT_RECENT = 'Import a Recent Project';


class UploadModal extends React.Component {
  constructor() {
    super();
  }

  render() {
    return (
      <div>
        <Nav bsStyle="tabs" activeKey={parseInt(this.props.active)}
             onSelect={this.props.changeActive}
             style={{padding: "2px 2px 0px 2px", backgroundColor: "var(--background-color-dark)"}}>
          <NavItem eventKey={1}>{IMPORT_ONLINE}</NavItem>
          <NavItem eventKey={2}>{IMPORT_LOCAL}</NavItem>
          <NavItem eventKey={3}>{IMPORT_USFM}</NavItem>
          <NavItem eventKey={4}>{IMPORT_RECENT}</NavItem>
        </Nav>
        <div style={{color: "var(--reverse-color)", padding: "20px", backgroundColor: "var(--background-color-dark)"}}>
          {this.props.children}
        </div>
      </div>
    );
  }
}

UploadModal.propTypes = {
    children: PropTypes.any,
    active: PropTypes.any.isRequired,
    changeActive: PropTypes.any.isRequired
};

module.exports = UploadModal;
