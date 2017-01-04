const React = require('react');
const bootstrap = require('react-bootstrap');
var CryptoJS = require("crypto-js");
const gogs = require('../components/core/login/GogsApi.js');
const remote = require('electron').remote;
const {dialog} = remote;
const path = require('path');
const fs = require(window.__base + 'node_modules/fs-extra');

const merge = require('lodash.merge');

const NavMenu = require('./../components/core/navigation_menu/NavigationMenu.js');
const SideBarContainer = require('../components/core/SideBar/SideBarContainer');
const StatusBar = require('../components/core/SideBar/StatusBar');
const LoginModal = require('../components/core/login/LoginModal');
const Gogs = require('../components/core/login/GogsApi')();
const ImportUsfm = require('../components/core/Usfm/ImportUSFM.js');
const SwitchCheckModal = require('../components/core/SwitchCheckModal');
const SwitchCheck = require('../components/core/SwitchCheck');
const SettingsModal = require('../components/core/SettingsModal.js');
const ProjectModal = require('../components/core/create_project/ProjectModal');
const Loader = require('../components/core/Loader');
const RootStyles = require('./RootStyle');
const Grid = require('react-bootstrap/lib/Grid.js');
const Button = require('react-bootstrap/lib/Button.js');
const Row = require('react-bootstrap/lib/Row.js');
const Col = require('react-bootstrap/lib/Col.js');
const ModuleProgress = require('../components/core/ModuleProgress/ModuleProgressBar')
const Toast = require('../NotificationApi/ToastComponent');
const CheckDataGrabber = require('../components/core/create_project/CheckDataGrabber.js');
const loadOnline = require('../components/core/LoadOnline');

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
            var loginModalProps = this.state.loginModalProps
            if (!loginModalProps.profile === profileVisible || !loginModalProps.visibleLoginModal === loginVisible) {
              this.setState(merge({}, this.state, {
                loginModalProps: {
                  visibleLoginModal: loginVisible,
                  profile:profileVisible
                }
              }));
            }
          },
          updateProfileVisibility: () => {
            const profileVisible = CoreStore.getProfileVisibility() || false;
            const loginVisible = CoreStore.getLoginModal() || false;
            var loginModalProps = this.state.loginModalProps
            if (!loginModalProps.profile === profileVisible || !loginModalProps.visibleLoginModal === loginVisible) {
              this.setState(merge({}, this.state, {
                loginModalProps: {
                  profile: profileVisible,
                  visibleLoginModal: loginVisible
                }
              }));
            }
          },
          close: () => {
            CoreActions.updateLoginModal(false);
          }
        },
        importUsfmProps: {
          openUSFM: ImportUsfm.open,
          filePath: 'No file selected',
          checkIfValid: (location) => {
            this.setState(merge({}, this.state, {
              importUsfmProps: {
                filePath: location,
                usfmSave: !(location == 'No file selected')
              }
            }));
          },
        },
        dragDropProps: {
          filePath: '',
          properties: ['openDirectory'],
          sendFilePath: (path, link, callback) => {
            this.setState(merge({}, this.state, {
              dragDropProps: {
                filePath: path,
              }
            }));
            Upload.sendFilePath(path, link, callback);
          },
        },
        projectModalProps: {
          showModal: false,
          show: 'link',
          showCreateProject: (input) => {
            var modal = CoreStore.getShowProjectModal();
            if (input) {
              modal = input;
              CoreStore.projectModalVisibility = input;
            }
            if (modal === 'Languages') {
              if (!this.state.projectModalProps.showModal) {
                this.setState(merge({}, this.state, {
                  projectModalProps: {
                    showModal: true,
                  }
                }));
              }
            } else if (modal === "") {
              if (this.state.projectModalProps.showModal) {
                this.setState(merge({}, this.state, {
                  projectModalProps: {
                    showModal: false,
                  }
                }))
              }
            }
          },

          submitLink: () => {
            var link = this.state.projectModalProps.link;
            loadOnline(link, function(err, savePath, url) {
              if (!err) {
                Upload.Methods.sendFilePath(savePath, url);
              } else {
                console.error(err);
              }
            });
          },

          close: () => {
            CoreStore.projectModalVisibility = "";
            this.setState(merge({}, this.state, {
              projectModalProps: {
                showModal: false,
              }
            }));
          },

         handleOnlineChange: (e) => {
           this.setState(merge({}, this.state, {
             projectModalProps: {
               link: e.target.value,
             }
           }));
         },

          onClick: (e) => {
            if (this.state.uploadProps.active == 1) {
              this.state.projectModalProps.submitLink();
            }
            if (this.state.uploadProps.active == 3) {
              if (!this.state.importUsfmProps.usfmSave) {
                return;
              }
            }
            api.emitEvent('changeCheckType', { currentCheckNamespace: null });
            api.emitEvent('newToolSelected', {'newToolSelected': true});
            this.state.projectModalProps.close();
            api.Toast.info('Info:', 'Your project is ready to be loaded once you select a tool', 5);
            if (this.state.uploadProps.active == 1){
              let loadedLink = this.link;
              if(loadedLink != ""){
                CoreActions.updateCheckModal(true);
              }
            }
          },

          _handleKeyPress: (e) => {
            if (e.key === 'Enter') {
              this.state.projectModalProps.onClick(e);
            }
          }
        },
        uploadProps: {
           active: 1,
           changeActive: (key) => {
             switch (key) {
               case 1:
                 this.setState(merge({}, this.state, {
                   projectModalProps: {
                     show: 'link',
                   },
                   uploadProps: {
                     active: key
                   }
                 }));
                 break;
               case 2:
                 this.setState(merge({}, this.state, {
                   projectModalProps: {
                     show: 'file',
                   },
                   uploadProps: {
                     active: key
                   }
                 }));
                 break;
               case 3:
                 this.setState(merge({}, this.state, {
                   projectModalProps: {
                     show: 'usfm',
                   },
                   uploadProps: {
                     active: key
                   }
                 }));
                 break;
               case 4:
                 this.setState(merge({}, this.state, {
                   projectModalProps: {
                     show: 'd43',
                   },
                   uploadProps: {
                     active: key
                   }
                 }));
                 break;
               default:
                 break;
             }
           }
        },
        profileProjectsProps: {
          repos: [],
          updateRepos: () => {
            var user = api.getLoggedInUser();
            if (user) {
              var _this = this;
              return Gogs.retrieveRepos(user.userName).then((repos) => {
                this.setState(merge({}, this.state, {
                  profileProjectsProps: {
                    repos: repos,
                  }
                }));
              });
            }
          },
          openSelected: (projectPath) => {
            var link = 'https://git.door43.org/' + projectPath + '.git';
            var _this = this;
            loadOnline(link, function(err, savePath, url) {
              if (err) {
                console.error(err);
              } else {
                Upload.sendFilePath(savePath, url)
                CoreActions.showCreateProject("");
              }
            });
          },
          makeList: (repos) => {
            var user = api.getLoggedInUser();
            if (!user) {
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
              projectList.push(
                <div key={p} style={{width: '100%', marginBottom: '15px'}}>
                  {projectName}
                  <Button bsStyle='primary' className={'pull-right'} bsSize='sm' onClick={this.state.profileProjectsProps.openSelected.bind(this, repoName)}>Load Project</Button>
                 </div>
              );
            }
            if (projectList.length === 0) {
              projectList.push(
                <div key={'None'} style={{width: '100%', marginBottom: '15px'}}>
                  No Projects Found
                </div>
               );
            }
            return projectList;
          }
        },
        settingsModalProps: {
          show: false,
          onClose: () => {
            CoreActions.updateSettings(false);
          },
          updateModal: () => {
            if (!this.state.settingsModalProps.show === CoreStore.getSettingsView()) {
              this.setState(merge({}, this.state, {
                settingsModalProps: {
                  show: CoreStore.getSettingsView(),
                }
              }));
            }
          },
          onSettingsChange: (field) => {
            api.setSettings(field.target.name, field.target.value);
          },
          currentSettings: api.getSettings()
        },
        switchCheckModalProps: {
            showModal: false,
            updateCheckModal: () => {
              if (!this.state.switchCheckModalProps.showModal === CoreStore.getCheckModal()) {
                this.setState(merge({}, this.state, {
                  switchCheckModalProps: {
                    showModal: CoreStore.getCheckModal(),
                  }
                }));
              }
            },
            close: () => {
              CoreActions.updateCheckModal(false);
            },
            localAppFilePath: '',
            handleFilePathChange: (event) => {
              this.setState(merge({}, this.state, {
                switchCheckModalProps: {
                  localAppFilePath: event.target.value,
                }
              }));
            },
            developerApp: (filepath) => {
              var folderName = path.join(window.__base, filepath);
              fs.access(folderName, fs.F_OK, (err) => {
                if(!err){
                  console.log("Were in");
                  CheckDataGrabber.loadModuleAndDependencies(folderName);
                  localStorage.setItem('lastCheckModule', folderName);
                } else {
                  console.error(err);
                }
              });
              CoreActions.updateCheckModal(false);
            },
            developerMode: api.getSettings('developerMode') === 'enable',
            showDevOptions: false,
            updateDevOptions: () => {
              this.setState(merge({}, this.state, {
                switchCheckModalProps: {
                  showDevOptions: !this.state.switchCheckModalProps.showDevOptions,
                }
              }));
            }
        }
      });
    var tutorialState = api.getSettings('tutorialView');
    if (tutorialState === 'show' || tutorialState === null) {
      return merge({}, this.state, {
        firstTime: true
      })
    } else {
      return merge({}, this.state, {
        firstTime: false
      })
    }
  },

  componentDidMount: function () {
    if (localStorage.getItem('crashed') == 'true') {
      localStorage.removeItem('crashed');
      localStorage.removeItem('lastProject');
      api.setSettings('tutorialView', 'hide');
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
    if (api.getSettings('tutorialView') !== 'show' && saveLocation) {
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
          <SettingsModal {...this.state.settingsModalProps}/>
          <LoginModal loginProps={this.state.loginProps} profileProps={this.state.profileProps} profileProjectsProps={this.state.profileProjectsProps} {...this.state.loginModalProps} />
          <ProjectModal {...this.state.projectModalProps} uploadProps={this.state.uploadProps} importUsfmProps={this.state.importUsfmProps} dragDropProps={this.state.dragDropProps} profileProjectsProps={this.state.profileProjectsProps}/>
          <SideBarContainer />
          <StatusBar />
          <SwitchCheckModal {...this.state.switchCheckModalProps}>
            <SwitchCheck.Component />
          </SwitchCheckModal>
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
