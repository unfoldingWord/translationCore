/**
 * @author Ian Hoegen
 * @description: This is the modal for the drag and drop upload feature.
 ******************************************************************************/
const React = require('react');
const Path = require('path');

const Button = require('react-bootstrap/lib/Button.js');
const Nav = require('react-bootstrap/lib/Nav.js');
const NavItem = require('react-bootstrap/lib/NavItem.js');

const OnlineInput = require('./OnlineInput');
const DragDrop = require('./DragDrop');
const ImportUsfm = require('./Usfm/ImportUSFM');
const Recent = require('./RecentProjects.js');

const IMPORT_PROJECT = 'Import Translation Studio Project';
const IMPORT_LOCAL = 'Import From Local Project';
const IMPORT_ONLINE = 'Import From Online';
const IMPORT_USFM = 'Import From Local USFM File';
const IMPORT_D43 = 'Import From Door43';

class UploadModal extends React.Component {
  constructor() {
    super();
  }

  render() {
    var mainContent;
    var ProjectViewer = require('./login/Projects.js');
    switch (this.props.show) {
      case 'file':
        mainContent = <DragDrop
          styles={this.props.styles}
          sendFilePath={this.props.sendPath}
          properties={['openDirectory']}
          isWelcome={this.props.isWelcome}
          />;
        break;
      case 'link':
        mainContent = (
          <div>
            <br />
            <OnlineInput ref={"Online"} pressedEnter={this.props.pressedEnter} getLink={this.props.getLink} sendFilePath={this.props.sendPath} />
          </div>
        );
        break;
      case 'usfm':
        mainContent = (
          <div>
            <ImportUsfm.component checkIfValid={this.props.checkUSFM} isWelcome={this.props.isWelcome} ref={'USFM'}/>
          </div>
        );
        break;
      case 'd43':
        mainContent = (
          <div>
            <ProjectViewer />
          </div>
        )
        break;
      default:
        mainContent = (<div> </div>)
        break;
    }
    if (this.props.show !== false) {
      return (
        <div>
          <Nav bsStyle="tabs" activeKey={this.props.active} onSelect={this.props.changeActive}>
            <NavItem eventKey={1}>{IMPORT_ONLINE}</NavItem>
            <NavItem eventKey={2}>{IMPORT_LOCAL}</NavItem>
            <NavItem eventKey={3}>{IMPORT_USFM}</NavItem>
            <NavItem eventKey={4}>{IMPORT_D43}</NavItem>
          </Nav>
          {mainContent}
        </div>
      );
    } else {
      return (<div> </div>)
    }
  }
}


module.exports = UploadModal;
