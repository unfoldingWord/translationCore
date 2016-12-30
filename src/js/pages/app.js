const React = require('react');
const bootstrap = require('react-bootstrap');
var CryptoJS = require("crypto-js");
const gogs = require('../components/core/login/GogsApi.js');
const remote = require('electron').remote;
const {dialog} = remote;
var merge = require('lodash.merge');

const NavMenu = require('./../components/core/navigation_menu/NavigationMenu.js');
const SideBarContainer = require('../components/core/SideBar/SideBarContainer');
const StatusBar = require('../components/core/SideBar/StatusBar');
const LoginModal = require('../components/core/login/LoginModal');
const SwitchCheckModal = require('../components/core/SwitchCheckModal');
const SettingsModal = require('../components/core/SettingsModal.js');
const ProjectModal = require('../components/core/create_project/ProjectModal');
const Loader = require('../components/core/Loader');
const RootStyles = require('./RootStyle');
const Grid = require('react-bootstrap/lib/Grid.js');
const Row = require('react-bootstrap/lib/Row.js');
const Col = require('react-bootstrap/lib/Col.js');
const ModuleProgress = require('../components/core/ModuleProgress/ModuleProgressBar')
const Toast = require('../NotificationApi/ToastComponent');
const CheckDataGrabber = require('../components/core/create_project/CheckDataGrabber.js');

const Welcome = require('../components/core/welcome/welcome');
const AlertModal = require('../components/core/AlertModal');
const Access = require('../components/core/AccessProject.js');
const api = window.ModuleApi;
const CheckStore = require('../stores/CheckStore.js');
const ModuleWrapper = require('../components/core/ModuleWrapper');
const CoreActions = require('../actions/CoreActions.js');
const CoreStore = require('../stores/CoreStore.js');
const Popover = require('../components/core/Popover');
const Upload = require('../components/core/UploadMethods.js');

var Main = React.createClass({
  getInitialState() {
    const user = CoreStore.getLoggedInUser();
    this.state =
      Object.assign({}, this.state, {
        loginProps: {
          userdata: {
            username: "",
            password: ""
          },
          register: false,
          handleSubmit: (userDataSumbit) => {
            var Token = api.getAuthToken('gogs');
            var newuser = gogs(Token).login(userDataSumbit).then(function (userdata) {
              CoreActions.login(userdata);
              CoreActions.updateLoginModal(false);
              CoreActions.updateOnlineStatus(true);
              CoreActions.updateProfileVisibility(true);
            }).catch(function (reason) {
              console.log(reason);
              if (reason.status === 401) {
                dialog.showErrorBox('Login Failed', 'Incorrect username or password. This could be caused by using an email address instead of a username.');
              } else if (reason.message) {
                dialog.showErrorBox('Login Failed', reason.message);
              } else if (reason.data) {
                dialog.showErrorBox('Login Failed', reason.data);
              } else {
                dialog.showErrorBox('Login Failed', 'Unknown Error');
              }
            });
          },
          handleUserName: (e) => {
            this.setState(merge({}, this.state, {
              loginProps: {
                userdata: {
                  username: e.target.value
                }
              }
            }))
          },
          handlePassword: (e) => {
            this.setState(merge({}, this.state, {
              loginProps: {
                userdata: {
                  password: e.target.value
                }
              }
            }))
          },
          showRegistration: () => {
            this.setState(merge({}, this.state, {
              loginProps: {
                register: true
              }
            }))
          },
        },
        profileProps: {
          projectVisibility: false,
          handleLogout: () => {
            CoreActions.updateOnlineStatus(false);
            CoreActions.updateProfileVisibility(false);
            CoreActions.login(null);
            localStorage.removeItem('user');
          },
          showProjects: () => {
            this.setState(merge({}, this.state, {
              profileProps: {
                projectVisibility: true
              }
            }));
          },
          hideProjects: () => {
            this.setState(merge({}, this.state, {
              profileProps: {
                projectVisibility: false
              }
            }));
          },
          fullName: user ? user.full_name : null,
          userName: user ? user.username : null,
          profilePicture: user ? user.avatar_url : null,
          emailAccount: user ? user.email : null,
        },
        loginModalProps: {
          visibleLoginModal: false,
          profile: false,
          updateLoginModal: () => {
            const loginVisible = CoreStore.getLoginModal() || false;
            const profileVisible = CoreStore.getProfileVisibility() || false;
            this.setState(merge({}, this.state, {
              loginModalProps: {
                visibleLoginModal: loginVisible,
                profile:profileVisible
              }
            }))
          },
          updateProfileVisibility: () => {
            const profileVisible = CoreStore.getProfileVisibility() || false;
            const loginVisible = CoreStore.getLoginModal() || false;
            this.setState(merge({}, this.state, {
              loginModalProps: {
                profile: profileVisible,
                visibleLoginModal: loginVisible
              }
            }))
          },
          close: () => {
            CoreActions.updateLoginModal(false);
          }
        },
        projectModalProps: {
          showCreateProject(input) {
            var modal = CoreStore.getShowProjectModal();
            console.log(modal);
            if (input) {
              modal = input;
              CoreStore.projectModalVisibility = input;
            }
            if (modal === 'Languages') {
              console.log('calling');
              console.log(merge({}, this.state, {
                projectModalProps: {
                  showModal: true,
                }
              }));
              this.setState(merge({}, this.state, {
                projectModalProps: {
                  showModal: true,
                }
              }));
              console.log(this.state.projectModalProps);
            } else if (modal === "") {
              this.setState(merge({}, this.state, {
                projectModalProps: {
                  showModal: false,
                }
              }))
            }
          },

          submitLink() {
            var link = this.state.projectModalProps.link;
            loadOnline(link, function(err, savePath, url) {
              if (!err) {
                Upload.Methods.sendFilePath(savePath, url);
              } else {
                console.error(err);
              }
            });
          },

          close() {
            CoreStore.projectModalVisibility = "";
            this.setState(merge({}, this.state, {
              projectModalProps: {
                showModal: false,
              }
            }));
          },

         checkUSFM(location) {
           this.setState(merge({}, this.state, {
             projectModalProps: {
               usfmPath: location,
               usfmSave: !(location == 'No file selected')
             }
           }));
         },

         sendPath(path, link, callback) {
           this.setState(merge({}, this.state, {
             projectModalProps: {
               filePath: path,
             }
           }));
           this.setState({filePath: path});
           UploadMethods.sendFilePath(path, link, callback);
         },

         changeActive(key) {
           this.setState(merge({}, this.state, {
             projectModalProps: {
               active: key
             }
           }));
           switch (key) {
             case 1:
               this.setState(merge({}, this.state, {
                 projectModalProps: {
                   show: 'link',
                 }
               }));
               break;
             case 2:
               this.setState(merge({}, this.state, {
                 projectModalProps: {
                   show: 'file',
                 }
               }));
               break;
             case 3:
               this.setState(merge({}, this.state, {
                 projectModalProps: {
                   show: 'usfm',
                 }
               }));
             case 4:
               this.setState(merge({}, this.state, {
                 projectModalProps: {
                   show: 'd43',
                 }
               }));
               break;
             default:
               break;
           }
         },

         handleOnlineChange(e) {
           this.setState(merge({}, this.state, {
             projectModalProps: {
               link: e.target.value,
             }
           }));
         },

         getMainContent(key) {
           var mainContent;
           switch (key) {
             case 'file':
               mainContent = <DragDrop
                 filePath={this.state.filePath}
                 sendFilePath={this.sendPath.bind(this)}
                 properties={['openDirectory']}
                 />;
               break;
             case 'link':
               mainContent = (
                 <div>
                   <br />
                   <OnlineInput onChange={this.handleOnlineChange.bind(this)}/>
                 </div>
               );
               break;
             case 'usfm':
               mainContent = (
                 <div>
                   <ImportUsfm.component open={ImportUsfm.open} filePath={this.state.usfmPath} checkIfValid={this.checkUSFM.bind(this)}/>
                 </div>
               );
               break;
             case 'd43':
             var ProjectViewer = require('../../../containers/Projects.js');
               mainContent = (
                 <div>
                   <ProjectViewer />
                 </div>
               )
               break;
             default:
               mainContent = (<div> </div>)
               break;
           }
           return mainContent;
         },

          onClick(e) {
            if (this.state.projectModalProps.active == 1) {
              this.state.projectModalProps.submitLink();
            }
            if (this.state.projectModalProps.active == 3) {
              if (!this.state.projectModalProps.usfmSave) {
                return;
              }
            }
            api.emitEvent('changeCheckType', { currentCheckNamespace: null });
            api.emitEvent('newToolSelected', {'newToolSelected': true});
            this.state.projectModalProps.close();
            api.Toast.info('Info:', 'Your project is ready to be loaded once you select a tool', 5);
            if (this.state.projectModalProps.active == 1){
              let loadedLink = this.link;
              if(loadedLink != ""){
                CoreActions.updateCheckModal(true);
              }
            }
          },

          _handleKeyPress(e) {
            if (e.key === 'Enter') {
              this.state.projectModalProps.onClick(e);
            }
          }
        }
      });
    var tutorialState = api.getSettings('showTutorial');
    if (tutorialState === true || tutorialState === null) {
      return merge({}, this.state, {
        firstTime: true
      })
    } else {
      return merge({}, this.state, {
        firstTime: false
      })
    }
  },
  componentWillMount() {
    CoreStore.addChangeListener(this.state.projectModalProps.showCreateProject.bind(this));      // action to show create project modal
  },
  componentWillUnmount() {
    CoreStore.removeChangeListener(this.state.projectModalProps.showCreateProject.bind(this));
  },

  componentDidMount: function () {

    if (localStorage.getItem('crashed') == 'true') {
      localStorage.removeItem('crashed');
      localStorage.removeItem('lastProject');
      api.setSettings('showTutorial', false);
    }

    if (localStorage.getItem('user')) {
      var phrase = api.getAuthToken('phrase') != undefined ? api.getAuthToken('phrase') : "tc-core";
      var decrypted = CryptoJS.AES.decrypt(localStorage.getItem('user'), phrase);
      var userdata = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
      var _this = this;
      var Token = api.getAuthToken('gogs');
      var newuser = gogs(Token).login(userdata).then(function (userdata) {
        CoreActions.login(userdata);
        CoreActions.updateOnlineStatus(true);
        CoreActions.updateProfileVisibility(true);
      }).catch(function (reason) {
        console.log(reason);
        if (reason.status === 401) {
          dialog.showErrorBox('Login Failed', 'Incorrect username or password');
        } else if (reason.hasOwnProperty('message')) {
          dialog.showErrorBox('Login Failed', reason.message);
        } else if (reason.hasOwnProperty('data')) {
          let errorMessage = reason.data;
          dialog.showErrorBox('Login Failed', errorMessage);
        } else {
          dialog.showErrorBox('Login Failed', 'Unknown Error');
        }
      });
    }
    var saveLocation = localStorage.getItem('lastProject');
    if (api.getSettings('showTutorial') !== true && saveLocation) {
      Upload.sendFilePath(saveLocation, null, () => {
        var lastCheckModule = localStorage.getItem('lastCheckModule');
        if (lastCheckModule) {
          CoreActions.startLoading();
          CheckDataGrabber.loadModuleAndDependencies(lastCheckModule);
        }
      });
    }

  },

  componentDidUpdate: function (prevProps, prevState) {
    if (this.showCheck == true) {
      CoreActions.showCreateProject("Languages");
      this.showCheck = false;
    }
  },

  finishWelcome: function () {
    this.setState({
      firstTime: false
    });
    this.showCheck = true;
  },

  render: function () {
    var _this = this;
    if (this.state.firstTime) {
      return (
        <Welcome initialize={this.finishWelcome} />
      )
    } else {
      return (
        <div className='fill-height'>
          <SettingsModal />
          <LoginModal loginProps={this.state.loginProps} profileProps={this.state.profileProps} {...this.state.loginModalProps} />
          <ProjectModal {...this.state.projectModalProps}/>
          <SideBarContainer />
          <StatusBar />
          <SwitchCheckModal.Modal />
          <Popover />
          <Toast />
          <Grid fluid className='fill-height' style={{ marginLeft: '100px', paddingTop: "30px" }}>
            <Row className='fill-height main-view'>
              <Col className='fill-height' xs={5} sm={4} md={3} lg={2} style={{ padding: "0px", backgroundColor: "#747474", overflowY: "auto", overflowX: "hidden" }}>
                <NavMenu />
              </Col>
              <Col style={RootStyles.ScrollableSection} xs={7} sm={8} md={9} lg={10}>
                <Loader />
                <AlertModal />
                <ModuleWrapper />
                <ModuleProgress />
              </Col>
            </Row>
          </Grid>
        </div>
      )
    }
  }
});

module.exports = (
  <Main />
);
