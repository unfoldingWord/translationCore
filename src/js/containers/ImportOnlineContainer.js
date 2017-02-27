const React = require('react');
const { connect  } = require('react-redux');
const importOnlineActions = require('../actions/ImportOnlineActions.js');
const Button = require('react-bootstrap/lib/Button.js');
const Projects = require('../components/core/login/Projects');
const OnlineInput = require('../components/core/OnlineInput');


class ImportOnlineContainer extends React.Component {

    importOnlineButtion(projectName, p, repoName) {
        return (
            <div key={p} style={{ width: '100%', marginBottom: '15px' }}>
                {projectName}
                <Button bsStyle='primary' className={'pull-right'} bsSize='sm' onClick={() => this.props.openOnlineProject(repoName)}>Load Project</Button>
            </div>
        );
    }
    makeList(repos) {
        if (!this.props.loggedIn) {
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
        let onlineProjects = this.makeList(this.props.repos);
        return (
            <div>
                {this.props.showOnlineButton ?
                    (<div style={{ padding: '10% 0' }}>
                        <center>
                            <Button onClick={() => this.props.changeShowOnlineView(false)} style={{ width: '60%', fontWeight: 'bold', fontSize: '20px' }} bsStyle='primary' bsSize='large'>
                                <img src="images/D43.svg" width="90" style={{ marginRight: '25px', padding: '10px' }} />
                                Browse Door43 Projects
            </Button>
                            <div style={{ width: '60%', height: '20px', borderBottom: '2px solid white', textAlign: 'center', margin: '20px 0' }}>
                                <span style={{ fontSize: '20px', backgroundColor: '#333', fontWeight: 'bold', padding: '0 40px' }}>
                                    or
              </span>
                            </div>
                            <OnlineInput onChange={this.props.handleOnlineChange} load={() => this.props.loadProjectFromLink(this.props.importLink)} />
                        </center>
                    </div>)
                    :
                    <Projects onlineProjects={onlineProjects}
                      back={() => this.props.changeShowOnlineView(true)}
                      refresh={this.props.updateRepos} />}
            </div>
        )
    }
}

function mapStateToProps(state) {
    return Object.assign({}, state.importOnlineReducer);
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        changeShowOnlineView: (val) => {
            dispatch(importOnlineActions.changeShowOnlineView(val))
        },
        handleOnlineChange: (e) => {
            dispatch(importOnlineActions.getLink(e));
        },
        updateRepos: () => {
            dispatch(importOnlineActions.updateRepos());
        },
        loadProjectFromLink: (link) => {
            dispatch(importOnlineActions.loadProjectFromLink(link));
        },
        openOnlineProject: (projectPath) => {
            dispatch(importOnlineActions.openOnlineProject(projectPath));
        }
    }
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(ImportOnlineContainer);
