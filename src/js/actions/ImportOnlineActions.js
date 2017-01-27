const api = window.ModuleApi;
const consts = require('./CoreActionConsts');
const loadOnline = require('../components/core/LoadOnline');
const Gogs = require('../components/core/login/GogsApi')();

module.exports.changedImportOnlineView = function (view) {
    return {
        type: consts.CHANGED_IMPORT_VIEW,
        view: view == "online" ? true : false
    }
}

module.exports.updateRepos = function () {
    debugger;
    return ((dispatch, getState) => {
        var user = getState().loginReducer.userdata
        if (user) {
            var _this = this;
            return Gogs.retrieveRepos(user.userName).then((repos) => {
                dispatch({
                    type:consts.RECIEVE_REPOS,
                    repos:repos
                })
            });
        }
    })
}

module.exports.openOnlineProject = function (projectPath) {
    return ((dispatch) => {
        var link = 'https://git.door43.org/' + projectPath + '.git';
        var _this = this;
        loadOnline(link, function (err, savePath, url) {
            if (err) {
                alert(err);
                dispatch({ type: "LOADED_ONLINE_FAILED" })
            } else {
                Upload.sendFilePath(savePath, url, callback);
                dispatch({ type: "LOADED_ONLINE" })
            }
        });
    })
}

module.exports.getLink = function (e) {
    return {
        type: consts.IMPORT_LINK,
        importLink: e.target.value
    }
}

module.exports.loadProjectFromLink = function (link) {
    return ((dispatch) => {
        loadOnline(link, function (err, savePath, url) {
            if (!err) {
                Upload.sendFilePath(savePath, url, callback);
                dispatch({ type: "LOADED_ONLINE" })
            } else {
                alert(err);
                dispatch({ type: "LOADED_ONLINE_FAILED" })
            }
        });
    })
}

        //  repos: [],
        //   updateRepos: () => {
        //     var user = api.getLoggedInUser();
        //     if (user) {
        //       var _this = this;
        //       return Gogs.retrieveRepos(user.userName).then((repos) => {
        //         this.setState(merge({}, this.state, {
        //           profileProjectsProps: {
        //             repos: repos,
        //           }
        //         }));
        //       });
        //     }
        //   },
        //   openSelected: (projectPath) => {
        //     var dispatch = this.props.dispatch;
        //     var link = 'https://git.door43.org/' + projectPath + '.git';
        //     var _this = this;
        //     loadOnline(link, function (err, savePath, url) {
        //       if (err) {
        //         console.error(err);
        //       } else {
        //         Upload.sendFilePath(savePath, url, () => {
        //           dispatch(showCreateProject(false));
        //         })
        //       }
        //     });
        //   },
        //   makeList: (repos) => {
        //     var user = api.getLoggedInUser();
        //     if (!user) {
        //       return (
        //         <div>
        //           <center>
        //             <br />
        //             <h4> Please login first </h4>
        //             <br />
        //           </center>
        //         </div>
        //       )
        //     }
        //     var projectArray = repos;
        //     var projectList = []
        //     for (var p in projectArray) {
        //       var projectName = projectArray[p].project;
        //       var repoName = projectArray[p].repo;
        //       projectList.push(
        //         <div key={p} style={{ width: '100%', marginBottom: '15px' }}>
        //           {projectName}
        //           <Button bsStyle='primary' className={'pull-right'} bsSize='sm' onClick={this.state.profileProjectsProps.openSelected.bind(this, repoName)}>Load Project</Button>
        //         </div>
        //       );
        //     }
        //     if (projectList.length === 0) {
        //       projectList.push(
        //         <div key={'None'} style={{ width: '100%', marginBottom: '15px' }}>
        //           No Projects Found
        //         </div>
        //       );
        //     }
        //     return projectList;
        //   }