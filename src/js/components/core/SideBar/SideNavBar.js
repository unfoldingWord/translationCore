
const api = window.ModuleApi;
const React = api.React;
const CoreActions = require('../../../actions/CoreActions.js');
const CoreStore = require('../../../stores/CoreStore.js');
const CheckStore = require('../../../stores/CheckStore.js');
const LoginButton = require("./LoginButton");
const SideBarButton = require("./SideBarButton");
const OnlineStatus = require('./OnlineStatus');
const RB = api.ReactBootstrap;
const {Glyphicon} = RB;
const Image = require('react-bootstrap/lib/Image.js');
const style = require("./Style");
const git = require('../GitApi.js');
const gogs = require('../login/GogsApi.js');
const pathFinder = require('path');
class SideNavBar extends React.Component{
  handleCreateProject(){
    CoreActions.showCreateProject("Languages");
  }

  handleOpenProject(){
    CoreActions.showOpenModal(true);
  }

  handleSyncProject(){
    const path = api.getDataFromCommon('saveLocation');
    const user = CoreStore.getLoggedInUser();
    if (user) {
      git(path).save('Updating with Door43', path, function() {
          var manifest = api.getDataFromCommon('tcManifest');
          if (manifest.repo) {
            var urlArray = manifest.repo.split('.');
            urlArray.pop();
            var finalPath = urlArray.pop().split('/');
            var repoPath = finalPath[1] + '/' + finalPath[2];
            var remote = 'https://' + user.token + '@git.door43.org/' + repoPath + '.git';
            git(path).update(remote, 'master', false, function(err){
              if (err) {
                var Confirm = {
                  title: 'You don\'t have permission to push to this repository.',
                  content: "Would you like to create a new Door43 project?",
                  leftButtonText: "No",
                  rightButtonText: "Yes"
                }
                api.createAlert(Confirm, function(result){
                  if(result == 'Yes') {
                    const projectName = path.split(pathFinder.sep);
                    gogs(user.token).createRepo(user, projectName.pop()).then(function(repo) {
                      var newRemote = 'https://' + user.token + '@git.door43.org/' + repo.full_name + '.git';                      
                      git(path).update(newRemote, 'master', true, function(){});
                    }); 
                  } 
                });
              } else {
                alert('Update succesful');                
              }
            });
          } else {
                alert('There is no associated repository with this project. Would you like to make one?');
                console.log('project name');
                console.log(path.split('/').pop());            
          }
      });
    } else {
      alert('Login then try again');
      CoreActions.updateLoginModal(true);
    }
  }

  handleReport(){
    require("./../reports/ReportGenerator")(err => {
      if (err) {
        console.log(err);
      }
    });
  }

  handleChangeCheckCategory(){
    CoreActions.updateCheckModal(true);
  }

  handleSettings(){
    CoreActions.updateSettings(true);
  }

    render(){
      return(
        <div style={style.container}>
          <ul style={style.ul}>
            <img src="images/TC_Icon_logo.png" style={style.logo}/>
            <LoginButton />
            <SideBarButton handleButtonClick={this.handleCreateProject.bind(this)} glyphicon={"file"} value={"New"} />
            <SideBarButton handleButtonClick={this.handleOpenProject.bind(this)} glyphicon={"folder-open"} value={"Open"} />
            <SideBarButton handleButtonClick={this.handleSyncProject.bind(this)} glyphicon={"cloud-upload"} value={"Sync"} />
            <SideBarButton handleButtonClick={this.handleReport.bind(this)} glyphicon={"list-alt"} value={"Create Report"} />
            <SideBarButton handleButtonClick={this.handleChangeCheckCategory.bind(this)} glyphicon={"check"} value={"Check Category"} />
            <SideBarButton handleButtonClick={this.handleSettings.bind(this)} glyphicon={"cog"} value={"Settings"} />
            {/*<OnlineStatus />*/}
          </ul>
        </div>
      );
    }

}

module.exports = SideNavBar;
