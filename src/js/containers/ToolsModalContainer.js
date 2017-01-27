const React = require('react');
const { connect  } = require('react-redux');
const ToolsActions = require('../actions/ToolsActions.js');
const modalActions = require('../actions/ModalActions.js');
const { Modal, Tabs, Tab } = require('react-bootstrap/lib');
const SwitchCheck = require('../components/core/SwitchCheck.js');

class ToolsModalContainer extends React.Component {
    componentWillMount(){
        this.props.getToolsMetadatas();
    }
    render() {
        return (
          <div>
            <Tabs defaultActiveKey={1} id="uncontrolled-tab-example"
                  bsStyle="pills"
                  style={{borderBottom: "none", backgroundColor: "#5C5C5C", color: '#FFFFFF', width: "100%"}}>
              <Tab eventKey={1} title="Available Tools" style={{backgroundColor: "#333333"}}>
                <SwitchCheck {...this.props}/>
              </Tab>
              <Tab eventKey={2} title="Online Tools" style={{backgroundColor: "#333333"}}>
              </Tab>
            </Tabs>
          </div>
        )
    }
}

function mapStateToProps(state) {
    return Object.assign({}, state.toolsReducer);
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        getToolsMetadatas: () => {
            dispatch(ToolsActions.getToolsMetadatas());
        },
        handleLoadTool: (toolFolderPath) => {
            dispatch(ToolsActions.loadTool(toolFolderPath));
        },
        showLoad: () => {
            dispatch(modalActions.selectModalTab(2))
        }
    }
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(ToolsModalContainer);
