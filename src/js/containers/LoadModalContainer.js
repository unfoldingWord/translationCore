import React from 'react';
import { connect } from 'react-redux';
import { Tabs, Tab } from 'react-bootstrap/lib';
// containers
import RecentProjectsContainer from './RecentProjectsContainer';
import ImportOnlineContainer from './ImportOnlineContainer';
// Actions
import * as dragDropActions from '../actions/DragDropActions.js';
import * as ReportsActions from '../actions/ReportsActions.js';
import * as recentProjectsActions from '../actions/RecentProjectsActions.js';
import * as ModalActions from '../actions/ModalActions';

class LoadModalContainer extends React.Component {

  render() {
    let { selectSectionTab } = this.props;

    return (
      <div>
        <Tabs
          id="controlled-tab-example"
          activeKey={this.props.currentSection}
          onSelect={(e) => selectSectionTab(2, e)}
          bsStyle="pills"
          style={{ borderBottom: "none", backgroundColor: "var(--accent-color)", color: 'var(--text-color)', width: "100%" }}>
          <Tab eventKey={1} title="My Projects">
            <RecentProjectsContainer {...this.props}/>
          </Tab>
          <Tab eventKey={3} title="Import Online Project">
            <ImportOnlineContainer />
          </Tab>
        </Tabs>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    ...state.dragDropReducer,
    ...state.recentProjectsReducer,
    ...state.reportsReducer,
    ...state.toolsReducer,
    ...state.importOnlineReducer,
    ...state.projectDetailsReducer
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    dragDropOnClick: (open, properties) => {
      dispatch(dragDropActions.onClick(open, properties));
    },
    onLoadReports: () => {
      dispatch(ReportsActions.loadReports());
    },
    loadProject: () => {
      dispatch(recentProjectsActions.startLoadingNewProject());
    },
    sendFilePath: filePath => {
      dispatch(dragDropActions.sendFilePath(filePath));
    },
    selectModalTab: (e, section, visible) => {
      dispatch(ModalActions.selectModalTab(e, section, visible));
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LoadModalContainer);
