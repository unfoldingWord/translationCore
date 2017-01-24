const React = require('react');
const { Modal, Button, Tabs, Tab, Glyphicon } = require('react-bootstrap/lib');
const api = window.ModuleApi;
const modalActions = require('../actions/ModalActions.js');
const { connect  } = require('react-redux');
const Application = require('./ApplicationModalContainer');
const Load = require('./LoadModalContainer');
const Tools = require('./ToolsModalContainer');
const SvgLogo = require('../components/core/svg_components/svgLogo.js')

class ModalContainer extends React.Component {
    render() {
      //as i mentioned before i dont want to have all of this
      //presentational Component code here instead of its own componetn. what do you think?
      let { currentTab, visible, hide, selectModalTab } = this.props;
      //TODO: move styling to a separate file
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
          <Modal.Body style={{height: "75vh", padding: "0px", backgroundColor: "#333333" }}>
            <Tabs activeKey={currentTab}
                  onSelect={(e) => selectModalTab(e)}
                  id="tabs"
                  style={{paddingTop: "3px", borderBottom: "none", backgroundColor: "#474747", color: '#FFFFFF', width: "100%"}}>
              <Tab eventKey={1} title={appGlyph} style={{backgroundColor: "#333333", paddingTop: "1px"}}>
                  <Application {...this.props.application}/>
              </Tab>
              <Tab eventKey={2} title={projectsGlyph} style={{backgroundColor: "#333333", paddingTop: "1px"}}>
                  <Load {...this.props.load}/>
              </Tab>
              <Tab eventKey={3} title={toolsGlyph} style={{backgroundColor: "#333333", paddingTop: "1px"}}>
                  <Tools {...this.props.tools}/>
              </Tab>
            </Tabs>
          </Modal.Body>
          <Modal.Footer style={{backgroundColor: "#333333", borderTop: "none"}}>
            <Button bsStyle="danger" onClick={() => hide()}>Close</Button>
          </Modal.Footer>
        </Modal>
      )
    }
}

function mapStateToProps(state) {
    return Object.assign({}, state, state.newModalReducer);
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        hide: () => {
            dispatch(modalActions.showModalContainer(false));
        },
        selectModalTab: (e) => {
            dispatch(modalActions.selectModalTab(e));
        }
    }
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(ModalContainer);
