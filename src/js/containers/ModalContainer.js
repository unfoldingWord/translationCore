import React from 'react';
import { connect  } from 'react-redux';
import { Modal, Tabs, Tab, Glyphicon } from 'react-bootstrap';
// container
import Application from './ApplicationModalContainer';
import Load from './LoadModalContainer';
import Tools from './ToolsModalContainer';
// components
import SvgLogo from '../components/core/svg_components/svgLogo.js';
import packageJson from '../../../package.json';
// actions
import { openAlertDialog } from '../actions/AlertModalActions.js';
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
      <Modal bsSize="large" show={visible} onHide={hide}>
              <Glyphicon
                onClick={() => hide()}
                glyph={"remove"}
                style={{color: "var(--reverse-color)", cursor: "pointer", fontSize: "16px", float: "right", zIndex: "9999", margin: "10px"}}
              />
        <Modal.Body style={{height: "550px", padding: "0px", backgroundColor: "var(--accent-color-dark)" }}>
          <Tabs activeKey={currentTab}
                onSelect={(e) => selectModalTab(this.props.loginReducer.loggedInUser, e, 1, true)}
                id="tabs"
                style={{borderBottom: "none", backgroundColor: "var(--accent-color-dark)", color: 'var(--reverse-color)', width: "100%"}}>
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
      </Modal>
    );
  }
}

function mapStateToProps(state) {
  return {
    ...state.newModalReducer,
    loginReducer: state.loginReducer
  };
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    hide: () => {
      dispatch(modalActions.showModalContainer(false));
    },
    selectModalTab: (loggedInUser, tabKey, sectionKey, visible) => {
      if (!loggedInUser) {
        if (tabKey !== 1) {
          dispatch(openAlertDialog("You must be logged in to use translationCore"));
          return;
        }
      }
      dispatch(modalActions.selectModalTab(tabKey, sectionKey, visible));
    },
    selectSectionTab: (tabKey, sectionKey) => {
      dispatch(modalActions.selectSectionTab(tabKey, sectionKey));
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ModalContainer);
