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
    let activeStyle = {color: "#FFFFFF", fontSize: "20px", margin: "0px 10px 0px 0px"};
    let inactiveStyle = {color: "#333333", fontSize: "20px", margin: "auto"};
    let appGlyph = <div style={{display: "flex"}}><div style={{margin: (currentTab === 1) ?  "0px 10px 0px 0px" : "auto"}}>
                      <SvgLogo height="24px" color={(currentTab === 1) ? "#FFFFFF" : "#333333" }/></div>
                        {(currentTab === 1) ? ' Application' : " "}
                    </div>;
    let projectsGlyph = <div style={{display: "flex"}}>
                          <Glyphicon glyph="folder-open"
                                      style={(currentTab === 2) ? activeStyle : inactiveStyle} />
                          {(currentTab === 2) ? " Projects" : " "}
                        </div>;
    let toolsGlyph = <div style={{display: "flex"}}>
                        <Glyphicon glyph="wrench"
                                    style={(currentTab === 3) ? activeStyle : inactiveStyle} />
                          {(currentTab === 3) ? " Tools" : " "}
                      </div>;
    return (
      <Modal bsSize="lg" show={visible} onHide={hide}>
        <Modal.Body style={{height: "600px", padding: "0px", backgroundColor: "#333333" }}>
          <Tabs activeKey={currentTab}
                onSelect={(e) => selectModalTab(e, 1, true)}
                id="tabs"
                style={{paddingTop: "3px", borderBottom: "none", backgroundColor: "#474747", color: '#FFFFFF', width: "100%"}}>
            <Tab eventKey={1} title={appGlyph} style={{backgroundColor: "#333333", paddingTop: "1px"}}>
                <Application
                  currentSection={this.props.currentSection}
                  selectSectionTab={this.props.selectSectionTab}/>
            </Tab>
            <Tab eventKey={2} title={projectsGlyph} style={{backgroundColor: "#333333", paddingTop: "1px"}}>
                <Load currentSection={this.props.currentSection}
                  selectSectionTab={this.props.selectSectionTab}/>
            </Tab>
            <Tab eventKey={3} title={toolsGlyph} style={{backgroundColor: "#333333", paddingTop: "1px"}}>
                <Tools currentSection={this.props.currentSection}
                  selectSectionTab={this.props.selectSectionTab}/>
            </Tab>
          </Tabs>
        </Modal.Body>
        <Modal.Footer style={{padding: "10px", backgroundColor: "#333333", borderTop: "none"}}>
          <Button bsStyle="danger" style={{float: "right"}} onClick={() => hide()}>Close</Button>
          <center style={{color: "#FFFFFF", padding: "6px"}}>
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
