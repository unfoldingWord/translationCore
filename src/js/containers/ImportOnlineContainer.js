import React from 'react';
import { connect } from 'react-redux';
import {Button} from 'react-bootstrap/lib';
// Components
import Projects from '../components/core/login/Projects';
import OnlineInput from '../components/core/OnlineInput';
// Actions
import * as importOnlineActions from '../actions/ImportOnlineActions.js';
import * as ModalActions from '../actions/ModalActions.js';
import * as NotificationActions from '../actions/NotificationActions.js';

class ImportOnlineContainer extends React.Component {

  importOnlineButtion(projectName, p, repoName) {
    return (
        <div key={p} style={{ width: '100%', marginBottom: '15px' }}>
            {projectName}
            <Button bsStyle="primary" className={'pull-right'} bsSize="sm"
                    onClick={() => this.props.actions.openOnlineProject(repoName)}>
              Load Project
            </Button>
        </div>
    );
  }

  componentWillReceiveProps(newProps) {
    if (newProps.modalReducer.currentSection === 3 && newProps.modalReducer.currentTab === 2 && !newProps.importOnlineReducer.showOnlineButton && (newProps.modalReducer.currentTab !== this.props.modalReducer.currentTab || newProps.modalReducer.currentSection !== this.props.modalReducer.currentSection)) {
      this.props.actions.updateRepos();
    }
  }

  makeList(repos) {
    if (!this.props.importOnlineReducer.loggedIn) {
      return (
        <div>
          <center>
            <br />
            <h4> Please login first </h4>
            <br />
          </center>
        </div>
      )
    }
    var projectArray = repos;
    var projectList = []
    for (var p in projectArray) {
      var projectName = projectArray[p].project;
      var repoName = projectArray[p].repo;
      projectList.push(this.importOnlineButtion(projectName, p, repoName));
    }
    if (projectList.length === 0) {
      projectList.push(
          <div key={'None'} style={{ width: '100%', marginBottom: '15px' }}>
              No Projects Found
          </div>
      );
    }
    return projectList;
  }

  render() {
    let onlineProjects = this.makeList(this.props.importOnlineReducer.repos);
    let {changeShowOnlineView, handleOnlineChange, loadProjectFromLink} = this.props.actions;
    let {importLink, showOnlineButton, showLoadingCircle, loggedIn} = this.props.importOnlineReducer;
    return (
      <div>
        {showOnlineButton ?
            (<div style={{ padding: '10% 0' }}>
                <center>
                <Button onClick={() => changeShowOnlineView(false)} style={{ width: '60%', fontWeight: 'bold', fontSize: '20px' }} bsStyle='primary' bsSize='large'>
                  <img src="images/D43.svg" width="90" style={{ marginRight: '25px', padding: '10px' }} />
                  Browse Door43 Projects
                </Button>
                <div style={{ width: '60%', height: '20px', borderBottom: '2px solid var(--reverse-color)', textAlign: 'center', margin: '20px 0' }}>
                  <span style={{ fontSize: '20px', backgroundColor: 'var(--reverse-color)', fontWeight: 'bold', padding: '0 40px' }}>
                    or
                  </span>
                </div>
                <OnlineInput
                  onChange={handleOnlineChange}
                  load={() => loadProjectFromLink(importLink, loggedIn)}
                  showLoadingCircle={showLoadingCircle}
                />
              </center>
            </div>)
            :
            (<Projects
              onlineProjects={onlineProjects}
              back={() => this.props.actions.changeShowOnlineView(true)}
            />)
        }
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    importOnlineReducer: state.importOnlineReducer,
    modalReducer: state.newModalReducer
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    actions: {
      changeShowOnlineView: val => {
        dispatch(importOnlineActions.changeShowOnlineView(val));
      },
      handleOnlineChange: e => {
        dispatch(importOnlineActions.getLink(e));
      },
      updateRepos: () => {
        dispatch(importOnlineActions.updateRepos());
      },
      loadProjectFromLink: (link, loggedInUser) => {
        if (!loggedInUser) {
          dispatch(ModalActions.selectModalTab(1, 1, true));
          dispatch(NotificationActions.showNotification("Please login before loading a project", 5));
          return;
       };
        dispatch(importOnlineActions.loadProjectFromLink(link));
      },
      openOnlineProject: (projectPath, loggedInUser) => {
        if (!loggedInUser) {
          dispatch(ModalActions.selectModalTab(1, 1, true));
          dispatch(NotificationActions.showNotification("Please login before loading a project", 5));
          return;
        }
        dispatch(importOnlineActions.openOnlineProject(projectPath));
      }
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ImportOnlineContainer);
