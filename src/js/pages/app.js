const React = require('react');
const CoreActions = require('../actions/CoreActions.js');
const CoreActionsRedux = require('../actions/CoreActionsRedux.js');
const CheckStore = require('../stores/CheckStore.js');
const { connect  } = require('react-redux');

const bootstrap = require('react-bootstrap');
var CryptoJS = require("crypto-js");
const gogs = require('../components/core/login/GogsApi.js');
const sync = require('../components/core/SideBar/GitSync.js');
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
const ModuleWrapper = require('../components/core/ModuleWrapper');
const CoreStore = require('../stores/CoreStore.js');
const Popover = require('../components/core/Popover');
const Upload = require('../components/core/UploadMethods.js');

const showCreateProject = CoreActionsRedux.showCreateProject;

var Main = React.createClass({
  componentWillMount() {
    api.registerEventListener('changeCheckType', this.setCurrentToolNamespace);
    //changing tool
    api.registerEventListener('goToCheck', this.changeCheck);
    //changing check, (group index, check index) ...one or the other or both
    api.registerEventListener('changeGroupName', this.changeSubMenuItems);
    //changing just the group index
    api.registerEventListener('changedCheckStatus', this.changeSubMenuItemStatus);
    //changing the status of the current check
    api.registerEventListener('goToNext', this.goToNextCheck);
    //going to next check in entire list of checks, will go to next group also
    api.registerEventListener('goToPrevious', this.goToPreviousCheck);
  },

  componentWillUnmount() {
    api.removeEventListener('changeCheckType', this.setCurrentToolNamespace);
    api.removeEventListener('goToCheck', this.changeCheck);
    api.removeEventListener('changeGroupName', this.changeSubMenuItems);
    api.registerEventListener('changedCheckStatus', this.changeSubMenuItemStatus);
    api.registerEventListener('goToPrevious', this.goToPreviousCheck);
  },

  goToPreviousCheck() {
    var lastCheck = this.state.currentCheckIndex - 1 <= 0;
    if (lastCheck) {
      this.state.menuHeadersProps.menuClick(this.state.currentGroupIndex - 1);
    }
    else this.state.subMenuProps.checkClicked(this.state.currentCheckIndex - 1);
  },

  goToNextCheck() {
    var lastCheck = this.state.currentCheckIndex + 1 >= this.state.currentSubGroupObjects.length;
    if (lastCheck) {
      this.state.menuHeadersProps.menuClick(this.state.currentGroupIndex + 1);
    }
    else this.state.subMenuProps.checkClicked(this.state.currentCheckIndex + 1);
  },
  updateCheckStore() {
    api.putDataInCheckStore(this.state.currentToolNamespace, 'currentCheckIndex', this.state.currentCheckIndex);
    api.putDataInCheckStore(this.state.currentToolNamespace, 'currentGroupIndex', this.state.currentGroupIndex);
    api.putDataInCheckStore(this.state.currentToolNamespace, 'groups', this.state.currentGroupObjects);
  },
  changeSubMenuItemStatus({groupIndex, checkIndex, checkStatus}) {
    const newSubGroupObjects = this.state.currentSubGroupObjects.slice(0);
    newSubGroupObjects[this.state.currentCheckIndex].checkStatus = checkStatus;
    const newGroupObjects = this.state.currentGroupObjects.slice(0);
    newGroupObjects[this.state.currentGroupIndex].checks = newSubGroupObjects;
    newGroupObjects[this.state.currentGroupIndex].currentGroupprogress = this.getGroupProgress(newGroupObjects[this.state.currentGroupIndex]);
    this.setState({
      currentSubGroupObjects: newSubGroupObjects,
      currentGroupObjects: newGroupObjects
    });
  },
  getGroupProgress: (groupObj) => {
    var numChecked = 0;
    for (var i = 0; i < groupObj.checks.length; i++) {
      if (groupObj.checks[i].checkStatus != "UNCHECKED") numChecked++;
    }
    return numChecked / groupObj.checks.length;
  },
  changeSubMenuItems({groupName}) {
    const newSubGroupObjects = this.getSubMenuItems(this.state.currentToolNamespace, groupName);
    this.setState({
      currentSubGroupObjects: newSubGroupObjects,
      currentGroupName: groupName,
      currentCheckIndex: 0
    });
  },
  changeCheck(tool) {
    this.setState(merge({}, this.state, {
      currentGroupIndex: tool.groupIndex,
      currentCheckIndex: tool.checkIndex
    }))
  },

  setCurrentToolNamespace({currentCheckNamespace}) {
    //switched Tool therefore generate New MenuHeader
    var groupName = this.state.currentGroupName;
    var currentGroupIndex = 0;
    var currentCheckIndex = 0;
    /*first load of fresh project thus no groupName
    * in checkstore then get groupName at groupindex 0
    */
    if (currentCheckNamespace && !groupName) {
      currentGroupIndex = api.getDataFromCheckStore(currentCheckNamespace, 'currentGroupIndex');
      currentCheckIndex = api.getDataFromCheckStore(currentCheckNamespace, 'currentCheckIndex');
      groupName = api.getDataFromCheckStore(currentCheckNamespace, 'groups')[currentGroupIndex].group;
    }
    var groupObjects = api.getDataFromCheckStore(currentCheckNamespace, 'groups');
    for (var el in groupObjects) {
      groupObjects[el].currentGroupprogress = this.getGroupProgress(groupObjects[el]);
    }
    var subGroupObjects = this.getSubMenuItems(currentCheckNamespace, groupName);
    let bookName = api.getDataFromCheckStore(currentCheckNamespace, 'book');

    if (groupObjects) groupObjects[currentGroupIndex].isCurrentItem = true;
    if (subGroupObjects) subGroupObjects[currentCheckIndex].isCurrentItem = true;
    this.setState(merge({}, this.state, {
      currentGroupIndex: currentGroupIndex || 0,
      currentCheckIndex: currentCheckIndex || 0,
      currentToolNamespace: currentCheckNamespace,
      currentGroupName: groupName,
      currentGroupObjects: groupObjects,
      currentSubGroupObjects: subGroupObjects,
      currentBookName: bookName,
    }), () => this.state.menuHeadersProps.scrollToMenuElement(this.state.currentGroupIndex));
  },
  getMenuItemidFromGroupName(groupName) {
    var i = 0;
    for (var el in this.state.menuHeadersProps.groupObjects) {
      if (this.state.menuHeadersProps.groupObjects[el].group == groupName) return i;
      i++
    }
  },
  getSubMenuItems(name, groupName) {
    var namespace = this.state.currentToolNamespace || name;
    if (!namespace) return 'No namespace';
    let groups = api.getDataFromCheckStore(namespace, 'groups');
    let foundGroup = [];
    if (groupName) {
      if (groups) {
        foundGroup = groups.find(arrayElement => arrayElement.group === groupName);
      }
    }
    if (foundGroup) return foundGroup.checks;
    else return;
  },
  getInitialState() {
    const user = CoreStore.getLoggedInUser();
    this.state =
      Object.assign({}, this.state, {
        currentToolNamespace: null,
        currentGroupName: null,
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
          updateLoginModal: () => {

            const loginVisible = CoreStore.getLoginModal() || false;
            const profileVisible = CoreStore.getProfileVisibility() || false;
            this.setState({
              visibleLoginModal: loginVisible,
              profileVisible: profileVisible
            })
          },
          updateProfileVisibility: () => {

            const profileVisible = CoreStore.getProfileVisibility() || false;
            const loginVisible = CoreStore.getLoginModal() || false;
            this.setState({
              profileVisible: profileVisible,
              visibleLoginModal: loginVisible
            })
          },
          close: () => {
            CoreActions.updateLoginModal(false);
          }
        },
        sideBarContainerProps: {
          SideNavBar: false,
          imgPath: null,
          getCurrentToolNamespace: () => {

            //api.initialCurrentGroupName();
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
            var dispatch = this.props.dispatch;
            dispatch(showCreateProject("Languages"));
          },
          handleSelectTool: () => {
            var dispatch = this.props.dispatch;
            if (api.getDataFromCommon('saveLocation') && api.getDataFromCommon('tcManifest')) {
              CoreActions.updateCheckModal(true);
            } else {
              api.Toast.info('Open a project first, then try again', '', 3);
              dispatch(showCreateProject("Languages"));
            }
          }
        },
        sideNavBarProps: {
          handleOpenProject: () => {
            var dispatch = this.props.dispatch;
            dispatch(showCreateProject("Languages"));
          },
          handleSyncProject: () => {
            var dispatch = this.props.dispatch;
            if (api.getDataFromCommon('saveLocation') && api.getDataFromCommon('tcManifest')) {
              sync();
            } else {
              api.Toast.info('Open a project first, then try again', '', 3);
              dispatch(showCreateProject("Languages"));
            }
          },
          handleReport: () => {
            api.Toast.info('Generating reports...', '', 3);
            const Report = require("./../reports/ReportGenerator");
            api.emitEvent('ReportVisibility', { 'visibleReport': 'true' });
          },
          handleChangeCheckCategory: () => {
            var dispatch = this.props.dispatch;
            if (api.getDataFromCommon('saveLocation') && api.getDataFromCommon('tcManifest')) {
              CoreActions.updateCheckModal(true);
            } else {
              api.Toast.info('Open a project first, then try again', '', 3);
              dispatch(showCreateProject("Languages"));
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
          scrollToMenuElement: (id, name) => {
            const groupName = name || this.state.currentGroupObjects[id].group;
            //ALSO GETTING NEW SUBMENU ITEMS ON A CHANGE OF MENU ITEMS
            var newGroupElement = this.refs.sidebar.refs.menuheaders.refs[`${groupName}`];
            //this ref may be here forever...sigh
            var element = api.findDOMNode(newGroupElement);
            if (element) {
              element.scrollIntoView();
            }
          },
          menuClick: (id) => {
            this.state.menuHeadersProps.scrollToMenuElement(id);
            this.state.menuHeadersProps.setIsCurrentCheck(true, id, () => {
              var currentCheck = this.state.currentGroupObjects[this.state.currentGroupIndex].checks[0];
              api.emitEvent('goToVerse', {
                chapterNumber: currentCheck.chapter,
                verseNumber: currentCheck.verse
              });
            });
          },
          setIsCurrentCheck: (status, id, callback) => {
            //The stroe should dictate whether the current chekc is "current"(highlighted) not the other way around
            const newObj = this.state.currentGroupObjects.slice(0);
            newObj[this.state.currentGroupIndex].isCurrentItem = false;
            newObj[id].isCurrentItem = status;
            var groupName = newObj[id].group;
            // var currentSubGroupObjects = this.getSubMenuItems(this.state.currentToolNamespace, groupName);
            var currentSubGroupObjects = newObj[this.state.currentGroupIndex].checks;
            debugger;
            const _this = this;
            _this.checkIndex = null;
            currentSubGroupObjects.find((element, index) => {
              if (element.isCurrentItem) _this.checkIndex = index;
            });
            const newCheckIndex = _this.checkIndex || 0;
            if (!newCheckIndex) currentSubGroupObjects[0].isCurrentItem = true;
            else currentSubGroupObjects[newCheckIndex].isCurrentItem = true;
            //THIS IS VERY INEFFICIENT THIS VALUE DOES NOT NEED TO BE
            //SAVED LOCALLY
            this.setState({
              currentGroupObjects: newObj,
              currentGroupIndex: parseInt(id),
              currentCheckIndex: newCheckIndex,
              currentGroupName: groupName,
              currentSubGroupObjects: currentSubGroupObjects
            }, callback);
          },
        },
        subMenuProps: {
          scrollToMenuElement: (id) => {
            var newGroupElement = this.refs.navmenu.refs.submenu.refs[`${this.state.currentGroupIndex} ${id}`];
            //this ref may be here forever...sigh
            var element = api.findDOMNode(newGroupElement);
            if (element) {
              element.scrollIntoView();
            }
          },
          checkClicked: (id) => {
            this.state.subMenuProps.scrollToMenuElement(id);
            this.state.subMenuProps.setIsCurrentCheck(true, id, () => {

              var currentCheck = this.state.currentGroupObjects[this.state.currentGroupIndex].checks[this.state.currentCheckIndex];
              api.emitEvent('goToVerse', {
                chapterNumber: currentCheck.chapter,
                verseNumber: currentCheck.verse
              });
            });
          },
          setIsCurrentCheck: (status, id, callback) => {
            debugger;
            //This needs to change, the store should dictate whether
            //the current check is "current"(highlighted) not the other way around
            const newSubGroup = this.state.currentSubGroupObjects.slice(0);
            const newGroup = this.state.currentGroupObjects.slice(0);
            newSubGroup[this.state.currentCheckIndex].isCurrentItem = false;
            newSubGroup[id].isCurrentItem = status;
            //THIS IS VERY INEFFICIENT THIS VALUE DOES NOT NEED TO BE
            //SAVED LOCALLY IN THIS FASHION
            newGroup[this.state.currentGroupIndex].checks = newSubGroup;
            this.setState({
              currentCheckIndex: parseInt(id),
              currentSubGroupObjects: newSubGroup,
              currentGroupObjects:newGroup
            }, callback);
          },
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
            Upload.sendFilePath(path, link, callback); ``
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
            loadOnline(link, function (err, savePath, url) {
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
            debugger;
            if (this.state.uploadProps.active == 1) {
              this.state.projectModalProps.submitLink();
            }
            if (this.state.uploadProps.active == 3) {
              if (!this.state.importUsfmProps.usfmSave) {
                return;
              }
            }
            api.emitEvent('changeCheckType', { currentCheckNamespace: null });
            api.emitEvent('newToolSelected', { 'newToolSelected': true });
            this.state.projectModalProps.close();
            api.Toast.info('Info:', 'Your project is ready to be loaded once you select a tool', 5);
            if (this.state.uploadProps.active == 1) {
              let loadedLink = this.link;
              if (loadedLink != "") {
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
            var dispatch = this.props.dispatch;
            var link = 'https://git.door43.org/' + projectPath + '.git';
            var _this = this;
            loadOnline(link, function (err, savePath, url) {
              if (err) {
                console.error(err);
              } else {
                Upload.sendFilePath(savePath, url)
                dispatch(showCreateProject(false));
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
                <div key={p} style={{ width: '100%', marginBottom: '15px' }}>
                  {projectName}
                  <Button bsStyle='primary' className={'pull-right'} bsSize='sm' onClick={this.state.profileProjectsProps.openSelected.bind(this, repoName)}>Load Project</Button>
                </div>
              );
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
            this.setState(merge({}, this.state, {
              switchCheckModalProps: {
                developerMode: api.getSettings('developerMode') === 'enable'
              },
              settingsModalProps: {
                currentSettings: api.getSettings()
              }
            }));
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
              if (!err) {
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
        },
        alertModalProps: {
          open: false,
          handleOpen: () => {
            this.setState(merge({}, this.state, {
              alertModalProps: {
                open: !this.state.alertModalProps.open,
              }
            }));
          },
          alertMessage: () => {
            var data = CoreStore.getAlertMessage();
            if (data && !this.state.alertModalProps.visibility) {
              try {
                var alertMessage = data['alertObj'];
                this.setState(merge({}, this.state, {
                  alertModalProps: {
                    title: alertMessage['title'],
                    content: alertMessage['content'],
                    leftButtonText: alertMessage['leftButtonText'],
                    rightButtonText: alertMessage['rightButtonText'],
                    moreInfo: alertMessage['moreInfo'].toString(),
                    visibility: true
                  }
                }));
              } catch (e) {
              }
            }
          },

          handleAlertDismiss: () => {
            var response = this.state.alertModalProps.leftButtonText;
            this.setState(merge({}, this.state, {
              alertModalProps: {
                visibility: false,
                alertMessage: {}
              }
            }), CoreActions.sendAlertResponse(response));
          },

          handleAlertOK: () => {
            var response = this.state.alertModalProps.rightButtonText;
            this.setState(merge({}, this.state, {
              switchCheckModalProps: {
                visibility: false,
                alertMessage: {}
              }
            }), CoreActions.sendAlertResponse(response));
          },

          getStyleFromState: (value) => {
            if (value) {
              return {
                height: '30px',
                width: '60px',
                textAlign: 'center',
                verticalAlign: 'middle',
                padding: 0,
                left: '50%'
              }
            } else {
              return {
                display: 'none'
              }
            }
          }
        },
        loaderModalProps: {
          progress: 0,
          showModal: false,
          update: () => {
            if (CoreStore.doneLoading === this.state.loaderModalProps.showModal) {
              this.setState(merge({}, this.state, {
                loaderModalProps: {
                  progress: CoreStore.getProgress(),
                  showModal: !CoreStore.doneLoading
                }
              }));
            }
          },
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
      var dispatch = this.props.dispatch;
      dispatch(showCreateProject("Languages"));
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
    this.updateCheckStore();
    if (this.state.firstTime) {
      return (
        <Welcome initialize={this.finishWelcome} />
      )
    } else {
      return (
        <div className='fill-height'>
          <SettingsModal {...this.state.settingsModalProps} />
          <LoginModal loginProps={this.state.loginProps} profileProps={this.state.profileProps} profileProjectsProps={this.state.profileProjectsProps} {...this.state.loginModalProps} />
          <ProjectModal {...this.props.loginModalReducer} {...this.state.projectModalProps} uploadProps={this.state.uploadProps} importUsfmProps={this.state.importUsfmProps} dragDropProps={this.state.dragDropProps} profileProjectsProps={this.state.profileProjectsProps} />
          <SideBarContainer ref='sidebar' {...this.state} {...this.state.sideBarContainerProps} menuClick={this.state.menuHeadersProps.menuClick} />
          <StatusBar />
          <SwitchCheckModal {...this.state.switchCheckModalProps}>
            <SwitchCheck.Component />
          </SwitchCheckModal>
          <Popover />
          <Toast />
          <Grid fluid className='fill-height' style={{ marginLeft: '100px', paddingTop: "30px" }}>
            <Row className='fill-height main-view'>
              <Col className='fill-height' xs={5} sm={4} md={3} lg={2} style={{ padding: "0px", backgroundColor: "#747474", overflowY: "auto", overflowX: "hidden" }}>
                <NavMenu ref='navmenu' {...this.state} />
              </Col>
              <Col style={RootStyles.ScrollableSection} xs={7} sm={8} md={9} lg={10}>
                <Loader {...this.state.loaderModalProps} />
                <AlertModal {...this.state.alertModalProps} />
                <ModuleWrapper />
              </Col>
            </Row>
          </Grid>
        </div>
      )
    }
  }
});

function mapStateToProps(state) {
  //This will come in handy when we separate corestore and checkstore in two different reducers
  //Object.assign({}, state, state.coreStoreReducer)
  return state;
}

module.exports = connect(mapStateToProps)(Main);
