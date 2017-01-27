const React = require('react');
const { connect  } = require('react-redux');
const Modal = require('react-bootstrap/lib/Modal.js');
const Button = require('react-bootstrap/lib/Button.js');
const api = window.ModuleApi;
const RecentProjectsContainer = require('./RecentProjectsContainer');
const DragDrop = require('../components/core/DragDrop');
const ImportOnlineContainer = require('./ImportOnlineContainer');
const Projects = require('../components/core/login/Projects');
const { Tabs, Tab } = require('react-bootstrap/lib');
const dragDropActions = require('../actions/DragDropActions.js');

class LoadModalContainer extends React.Component {
  render() {
    return (
      <div>
        <Tabs defaultActiveKey={1} id="uncontrolled-tab-example"
          bsStyle="pills"
          style={{ borderBottom: "none", backgroundColor: "#5C5C5C", color: '#FFFFFF', width: "100%" }}>
          <Tab eventKey={1} title="My Projects" style={{ backgroundColor: "#333333" }}>
            <RecentProjectsContainer />
          </Tab>
          <Tab eventKey={2} title="Import Local Project" style={{ backgroundColor: "#333333" }}>
            <DragDrop {...this.props} />
          </Tab>
          <Tab eventKey={3} title="Import Online Project" style={{ backgroundColor: "#333333" }}>
          <ImportOnlineContainer />
          </Tab>
        </Tabs>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return Object.assign({}, state.dragDropReducer, state.recentProjectsReducer, state.importOnlineReducer);
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    dragDropOnClick: (open, properties) => {
      dispatch(dragDropActions.onClick(open, properties));
    },
  }
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(LoadModalContainer);
