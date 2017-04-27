import React from 'react';
import { connect  } from 'react-redux';
import { Modal, Button, Tabs, Tab, Glyphicon } from 'react-bootstrap';
// container
import Application from './ApplicationModalContainer';
import Load from './LoadModalContainer';
import Tools from './ToolsModalContainer';
// components
import SvgLogo from '../components/core/svg_components/svgLogo.js';
import packageJson from '../../../package.json';
// actions
import * as modalActions from '../actions/ModalActions.js';

class ModalContainer extends React.Component {

  render() {
    let { currentTab, visible, hide, selectModalTab } = this.props;

    let appGlyph = <div>
                        <Glyphicon glyph="user" style={{marginRight: "10px", fontSize: "20px"}} />
                        User
                    </div>;
    let projectsGlyph = <div>
                          <Glyphicon glyph="folder-open" style={{marginRight: "10px", fontSize: "20px"}} />
                          Projects
                        </div>;
    let toolsGlyph = <div>
                        <Glyphicon glyph="wrench" style={{marginRight: "10px", fontSize: "20px"}} />
                          Tools
                      </div>;
    return (
      <Modal bsSize="lg" show={visible} onHide={hide}>
        <Modal.Body style={{height: "600px", padding: "0px", backgroundColor: "#ffffff" }}>
          <Tabs activeKey={currentTab}
                onSelect={(e) => selectModalTab(e, 1, true)}
                id="tabs"
                style={{borderBottom: "none", backgroundColor: "#145396", color: '#FFFFFF', width: "100%"}}>
            <Tab eventKey={1} title={appGlyph}>
                <Application
                  currentSection={this.props.currentSection}
                  selectSectionTab={this.props.selectSectionTab}/>
            </Tab>
            <Tab eventKey={2} title={projectsGlyph}>
                <Load currentSection={this.props.currentSection}
                  selectSectionTab={this.props.selectSectionTab}/>
            </Tab>
            <Tab eventKey={3} title={toolsGlyph}>
                <Tools currentSection={this.props.currentSection}
                  selectSectionTab={this.props.selectSectionTab}/>
            </Tab>
          </Tabs>
        </Modal.Body>
        <Modal.Footer style={{padding: "10px", backgroundColor: "#ffffff", borderTop: "none"}}>
          <Button bsStyle="danger" style={{float: "right"}} onClick={() => hide()}>Close</Button>
          <center style={{color: "#333333", padding: "6px"}}>
            {"Version " + packageJson.version}
          </center>
        </Modal.Footer>
      </Modal>
    )
  }
}

function mapStateToProps(state) {
  return {
    ...state.newModalReducer
  };
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    hide: () => {
      dispatch(modalActions.showModalContainer(false));
    },
    selectModalTab: (e, section, visible) => {
      dispatch(modalActions.selectModalTab(e, section, visible));
    },
    selectSectionTab: (tabKey, sectionKey) => {
      dispatch(modalActions.selectSectionTab(tabKey, sectionKey));
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalContainer);
