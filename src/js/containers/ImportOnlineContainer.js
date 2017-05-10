import React from 'react';
import { connect } from 'react-redux';
import {Button} from 'react-bootstrap/lib';
// Components
import Projects from '../components/core/login/Projects';
import OnlineInput from '../components/core/OnlineInput';
// Actions
import * as importOnlineActions from '../actions/ImportOnlineActions.js';

class ImportOnlineContainer extends React.Component {

  importOnlineButtion(projectName, p, repoName) {
    return (
        <div key={p} style={{ width: '100%', padding: "0 80px", display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", alignItems: "center" }}>
            {projectName}
            <Button bsStyle="prime"
                    onClick={() => this.props.actions.openOnlineProject(repoName)}>
              Import & Select
            </Button>
        </div>
    );
  }

  componentWillReceiveProps(newProps) {
    if (newProps.modalReducer.currentSection === 3 && newProps.modalReducer.currentTab === 2 && (newProps.modalReducer.currentTab !== this.props.modalReducer.currentTab || newProps.modalReducer.currentSection !== this.props.modalReducer.currentSection)) {
      this.props.actions.updateRepos();
    }
  }

  makeList(repos) {
    if (!this.props.loginReducer.loggedInUser) {
      return (
        <div>
          <center>
            <br />
            <h4> Unable to connect to the online projects. Please log into your Door43 account. </h4>
            <br />
          </center>
        </div>
      )
    }
    if (this.props.importOnlineReducer.err != null){
      return (
        <div>
          <center>
            <br />
            <h4>Unable to connect to the server. Please check your Internet connection.</h4>
            <br />
          </center>
        </div>
      )
    }
    var projectArray = repos;
    var projectList = [];
    for (var p in projectArray) {
      if (projectArray[p]) {
          var projectName = projectArray[p].project;
          var repoName = projectArray[p].repo;
          projectList.push(this.importOnlineButtion(projectName, p, repoName));
      }
    }
    if (projectList.length === 0) {
      projectList.push(
          <div key={'None'} style={{ width: '100%', textAlign: "center", marginTop: '30px', fontSize: "18px", fontWeight: "bold" }}>
              No Projects Found
          </div>
      );
    }
    return projectList;
  }

  render() {
    let onlineProjects = this.makeList(this.props.importOnlineReducer.repos);
    let {handleOnlineChange, loadProjectFromLink} = this.props.actions;
    let {importLink, showLoadingCircle} = this.props.importOnlineReducer;
    return (
      <div style={{height: "520px"}}>
        <Projects {...this.props} onlineProjects={onlineProjects} showLoadingCircle={showLoadingCircle}/>
        <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
          <div style={{fontSize: "18px", fontWeight: "bold", margin: "15px 0 10px"}}>
            Select one of your projects above or enter the URL of a project below
          </div>
          <OnlineInput
              onChange={handleOnlineChange}
              load={() => loadProjectFromLink(importLink)}
              importLink = {importLink}
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    importOnlineReducer: state.importOnlineReducer,
    modalReducer: state.newModalReducer,
    loginReducer: state.loginReducer
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
      loadProjectFromLink: (link) => {
        dispatch(importOnlineActions.importOnlineProject(link));
      },
      openOnlineProject: (projectPath) => {
        var link = 'https://git.door43.org/' + projectPath + '.git';
        dispatch(importOnlineActions.importOnlineProject(link));
      }
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ImportOnlineContainer);
