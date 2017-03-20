const React = require('react');
const { connect  } = require('react-redux');
const recentProjectsActions = require('../actions/RecentProjectsActions.js');
const { Modal, Tabs, Tab } = require('react-bootstrap/lib');
const Button = require('react-bootstrap/lib/Button.js');
const Glyphicon = require('react-bootstrap/lib/Glyphicon.js');
const RecentProjects = require('../components/core/RecentProjects');
const path = require('path-extra');
const fs = require(window.__base + 'node_modules/fs-extra');
const DEFAULT_SAVE = path.join(path.homedir(), 'translationCore');

class RecentProjectsContainer extends React.Component {
    generateButton(projectPath) {
        return (
            <span>
                <Button style={{ width: "50%", backgroundColor: '#C3105A', borderWidth: '0px', borderRadius: '0px', backgroundImage: 'linear-gradient(to bottom,#C3105A 0,#C3105A 100%)', color: 'white' }} onClick={() => this.props.onLoad(projectPath)}>
                    <Glyphicon glyph={'folder-open'} />
                    <span style={{ marginLeft: '10px', marginRight: '20px' }}>Open</span>
                </Button>
                <Button style={{ width: "50%", fontWeight: 'bold', borderWidth: '0px', borderRadius: '0px', backgroundImage: 'linear-gradient(to bottom, white 0, white 100%)', backgroundColor: 'white' }} onClick={() => this.props.syncProject(projectPath)}>
                    <Glyphicon glyph={'refresh'} />
                    <span style={{ marginLeft: '5px' }}> Sync </span>
                </Button>
            </span>
        )
    }
    getRecentProjects() {
        var projectPaths = this.props.recentProjects;
        var projects = [];
        for (var project in projectPaths) {
            var projectPath = path.join(DEFAULT_SAVE, projectPaths[project]);
            var projectName = projectPaths[project];
            if (projectName === '.DS_Store' || projectName === '.git') continue;
            var manifestLocation = path.join(projectPath, 'manifest.json');
            var manifest = {};
            try {
                manifest = require(manifestLocation);
            } catch (err) {
                // Happens with USFM projects
                manifest = { target_language: {}, ts_project: {} }
            }
            try {
              var stats = fs.statSync(projectPath);
            } catch (e) {
              continue;
            }
            var mtime = new Date(stats.mtime);
            var difference = mtime.getMonth() + 1 + '/' + mtime.getDate() + '/' + mtime.getFullYear();
            var buttonSpan = (this.generateButton(projectPath));
            projects.push(
                {
                    '': <Glyphicon glyph={'folder-open'} />,
                    'Project Name': projectName,
                    'Book': manifest.ts_project.name || 'Unknown',
                    'Language': manifest.target_language.name || 'Unknown',
                    'Date Updated': difference,
                    ' ': buttonSpan
                }
            );
        }
        if (projects.length === 0) return null;
        return projects;
    }
    render() {
        var recentProjectsData = this.getRecentProjects();
        return (
            <div>
                <RecentProjects.Component data={recentProjectsData} />
            </div>
        )
    }
}

function mapStateToProps(state) {
    return Object.assign({}, state.recentProjectsReducer);
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        onLoad: (projectPath) => {
            dispatch(recentProjectsActions.onLoad(projectPath));
        },
        syncProject: (projectPath) => {
            dispatch(recentProjectsActions.syncProject(projectPath));
        },
        loadProject: () => {
            dispatch(recentProjectsActions.startLoadingNewProject());
        }
    }
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(RecentProjectsContainer);
