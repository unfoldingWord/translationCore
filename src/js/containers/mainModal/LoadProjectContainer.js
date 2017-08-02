import React from 'react';
import { connect } from 'react-redux';
import { Tabs, Tab } from 'react-bootstrap/lib';
// containers
import RecentProjectsContainer from './RecentProjectsContainer';
import ImportOnlineContainer from './ImportOnlineContainer';
// Actions
import * as ModalActions from '../../actions/ModalActions';

class LoadProjectContainer extends React.Component {

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
    selectModalTab: (e, section, visible) => {
      dispatch(ModalActions.selectModalTab(e, section, visible));
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LoadProjectContainer);
