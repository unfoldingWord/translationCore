const React = require('react');
const bootstrap = require('react-bootstrap');
var CryptoJS = require("crypto-js");
const gogs = require('../components/core/login/GogsApi.js');
const sync = require('../components/core/SideBar/GitSync.js');
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
const Upload = require('../components/core/Upload');

var Main = React.createClass({
  componentWillMount() {
    api.registerEventListener('changeCheckType', this.setCurrentToolNamespace);
  },

  componentWillUnmount() {
    api.removeEventListener('changeCheckType', this.setCurrentToolNamespace);
  },

  setCurrentToolNamespace(namespace) {
    this.setState(merge({}, this.state, {
      currentToolNamespace: namespace.currentCheckNamespace
    }))
  },
  getMenuItemidFromGroupName(groupName) {
    var i = 0;
    for (var el in this.state.menuHeadersProps.groupObjects) {
      if (this.state.menuHeadersProps.groupObjects[el].group == groupName) return i;
      i++
    }
  },
  getInitialState() {
    const user = CoreStore.getLoggedInUser();
    this.state =
      Object.assign({}, this.state, {
        currentToolNamespace: null,
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
                profile: profileVisible
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
        sideBarContainerProps: {
          SideNavBar: false,
          imgPath: null,
          getCurrentToolNamespace: () => {
            api.initialCurrentGroupName();
            this.state.sideBarContainerProps.getToolIcon(this.state.currentToolNamespace);
          },
          getToolIcon: (currentToolNamespace) => {
            let iconPathName = null;
            let currentToolMetadata = null;
            let toolsMetadata = api.getToolMetaDataFromStore();
            if (toolsMetadata) {
              currentToolMetadata = toolsMetadata.find(
                (tool) => tool.name === currentToolNamespace
              );
            }
            if (currentToolMetadata) {
              let iconPathName = currentToolMetadata.imagePath;
              this.setState(merge({}, this.state, {
                sideBarContainerProps: {
                  imgPath: iconPathName
                }
              }));
            }
          },
          changeView: () => {
            this.setState(merger({}, this.state, {
              sideBarContainerProps: {
                SideNavBar: !this.state.SideNavBar
              }
            }))
          },
          handleOpenProject: () => {
            CoreActions.showCreateProject("Languages");
          },
          handleSelectTool: () => {
            if (api.getDataFromCommon('saveLocation') && api.getDataFromCommon('tcManifest')) {
              CoreActions.updateCheckModal(true);
            } else {
              api.Toast.info('Open a project first, then try again', '', 3);
              CoreActions.showCreateProject("Languages");
            }
          }
        },
        sideNavBarProps: {
          handleOpenProject: () => {
            CoreActions.showCreateProject("Languages");
          },
          handleSyncProject: () => {
            if (api.getDataFromCommon('saveLocation') && api.getDataFromCommon('tcManifest')) {
              sync();
            } else {
              api.Toast.info('Open a project first, then try again', '', 3);
              CoreActions.showCreateProject("Languages");
            }
          },
          handleReport: () => {
            api.Toast.info('Generating reports...', '', 3);
            const Report = require("./../reports/ReportGenerator");
            api.emitEvent('ReportVisibility', { 'visibleReport': 'true' });
          },
          handleChangeCheckCategory: () => {
            if (api.getDataFromCommon('saveLocation') && api.getDataFromCommon('tcManifest')) {
              CoreActions.updateCheckModal(true);
            } else {
              api.Toast.info('Open a project first, then try again', '', 3);
              CoreActions.showCreateProject("Languages");
            }
          },
          handleSettings: () => {
            CoreActions.updateSettings(true);
          },
          handlePackageManager: () => {
            var PackageManagerView = require("./../Package_Manager/PackageManagerView");
            ReactDOM.render(<PackageManagerView />, document.getElementById('package_manager'))
            api.emitEvent('PackManagerVisibility', { 'visiblePackManager': 'true' });
          }
        },
        menuHeadersProps: {
          groupName: null,
          groupObjects: [],
          updateCurrentMenuHeader: (params) => {
            this.state.menuHeadersProps.unselectOldMenuItem();
            this.state.menuHeadersProps.groupName = params.groupName;
            this.state.menuHeadersProps.selectNewMenuItem();
          },
          newToolSelected: (params) => {
            //switched Tool therefore generate New MenuHeader
            var groupObjects = api.getDataFromCheckStore(params.currentCheckNamespace, 'groups');
            var groupName = api.getCurrentGroupName();
            this.setState(merge({}, this.state, {
              menuHeadersProps: {
                groupName: groupName,
                groupObjects: groupObjects
              }
            }))
            /*first load of fresh project thus no groupName
            * in checkstore then get groupName at groupindex 0
            */
            if (params.currentCheckNamespace && !groupName) {
              let currentGroupIndex = api.getDataFromCheckStore(
                params.currentCheckNamespace, 'currentGroupIndex');
              try {
                groupName = api.getDataFromCheckStore(
                  params.currentCheckNamespace, 'groups')[currentGroupIndex].group;
              } catch (err) {
                console.warn("currentGroupIndex is undefined " + err);;
              }
            }
            if (groupName) {
              this.state.menuHeadersItemsProps.handleSelection(null, groupName);
            }
            //this.state.menuHeadersProps.generateProgressForAllMenuHeaders();
          },
          unselectOldMenuItem: () => {
            if (this.state.menuHeadersProps.groupName) {
              const id = this.getMenuItemidFromGroupName(this.state.menuHeadersProps.groupName);
              this.state.menuHeadersItemsProps.setIsCurrentCheck(false, id);
            }
          },
          selectNewMenuItem: () => {
            if (this.state.menuHeadersProps.groupName) {
              const id = this.getMenuItemidFromGroupName(this.state.menuHeadersProps.groupName);
              this.state.menuHeadersItemsProps.setIsCurrentCheck(true, id);
            }
          },
          updateSubMenuItemProgress: (params) => {
            let groups = api.getDataFromCheckStore(this.state.currentToolNamespace, 'groups');
            let foundGroup = groups.find(arrayElement => arrayElement.group === this.state.menuHeadersProps.groupName);
            let currentProgress = this.state.menuHeadersProps.getGroupProgress(foundGroup);
            if (this.state.menuHeadersProps.groupName) {
              const id = this.getMenuItemidFromGroupName(this.state.menuHeadersProps.groupName);
              this.state.menuHeadersItemsProps.setCurrentProgress(currentProgress, id);
            }
          },
          getGroupProgress: (groupObj) => {
            var numChecked = 0;
            var numUnchecked = 0;
            for (var i = 0; i < groupObj.checks.length; i++) {
              if (groupObj.checks[i].checkStatus != "UNCHECKED") {
                numChecked++;
              } else {
                numUnchecked++;
              }
            }
            var total = numChecked + numUnchecked;
            return numChecked / total;
          },
        },
        menuHeadersItemsProps: {
          handleSelection: (id, name) => {
            const groupName = name || this.state.menuHeadersProps.groupObjects[id].group;
            api.setCurrentGroupName(groupName);
            var newGroupName = this.refs.sidebar.refs.menuheaders.refs[`${groupName}`];
            var element = api.findDOMNode(newGroupName);
            if (element) {
              element.scrollIntoView();
            }
          },

          groupNameClicked: (id) => {
            this.state.menuHeadersItemsProps.handleSelection(id);
            this.state.menuHeadersItemsProps.setIsCurrentCheck(true, id);
          },

          setIsCurrentCheck: (status, id) => {
            const newObj = this.state.menuHeadersProps.groupObjects.slice(0);
            newObj[id].isCurrentItem = status;
            this.setState(merge({}, this.state, {
              menuHeadersProps: {
                groupObjects: newObj
              }
            }
            ));
          },
          setCurrentProgress: (progress, id) => {
            const newObj = this.state.menuHeadersProps.groupObjects.slice(0);
            newObj[id].currentGroupprogress = progress;
            this.setState(merge({}, this.state, {
              menuHeadersProps: {
                groupObjects: newObj
              }
            }));
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
          <ProjectModal />
          <SideBarContainer ref='sidebar' currentToolNamespace={this.state.currentToolNamespace} menuHeadersItemsProps={this.state.menuHeadersItemsProps} menunHeaderProps={this.state.menuHeadersProps} sideNavBarProps={this.state.sideNavBarProps} {...this.state.sideBarContainerProps} />
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
