const React = require('react');
const ReactDOM = require('react-dom');
const CoreActions = require('../actions/CoreActions.js');
const CoreActionsRedux = require('../actions/CoreActionsRedux.js');
const CheckStore = require('../stores/CheckStore.js');
const { connect  } = require('react-redux');
const pathex = require('path-extra');
const PARENT = pathex.datadir('translationCore');
const PACKAGE_SUBMODULE_LOCATION = pathex.join(window.__base, 'tC_apps');
const bootstrap = require('react-bootstrap');
var CryptoJS = require("crypto-js");
const gogs = require('../components/core/login/GogsApi.js');
const sync = require('../components/core/SideBar/GitSync.js');
const remote = require('electron').remote;
const {dialog} = remote;
const path = require('path-extra');
const defaultSave = path.join(path.homedir(), 'translationCore');
const {shell} = require('electron');
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
const RecentProjects = require('../components/core/RecentProjects');
const AppDescription = require('../components/core/AppDescription');

const Welcome = require('../components/core/welcome/welcome');
const AlertModal = require('../components/core/AlertModal');
const Access = require('../components/core/AccessProject.js');
const api = window.ModuleApi;
const ModuleWrapper = require('../components/core/ModuleWrapper');
const CoreStore = require('../stores/CoreStore.js');
const Popover = require('../components/core/Popover');
const Upload = require('../components/core/UploadMethods.js');

const showCreateProject = CoreActionsRedux.showCreateProject;
const updateLoginModal = CoreActionsRedux.updateLoginModal;
const updateProfileModal = CoreActionsRedux.updateProfileModal;
const showLoginProfileModal = CoreActionsRedux.showLoginProfileModal;
const showMainView = CoreActionsRedux.showMainView;
const showSwitchCheckModal = CoreActionsRedux.showSwitchCheckModal;

var Main = React.createClass({
  componentWillMount() {
    this.updateTools();
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
    window.removeEventListener('resize', this.state.sideBarContainerProps.updateDimensions);
    api.removeEventListener('changeCheckType', this.setCurrentToolNamespace);
    api.removeEventListener('goToCheck', this.changeCheck);
    api.removeEventListener('changeGroupName', this.changeSubMenuItems);
    api.removeEventListener('changedCheckStatus', this.changeSubMenuItemStatus);
    api.removeEventListener('goToPrevious', this.goToPreviousCheck);
  },

  goToPreviousCheck() {
    var lastCheck = this.state.currentCheckIndex - 1 < 0;
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
    if (!currentCheckNamespace) return;
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
      if(currentGroupIndex && currentCheckIndex){
        groupName = api.getDataFromCheckStore(currentCheckNamespace, 'groups')[currentGroupIndex].group;
      }
    }
    var groupObjects = api.getDataFromCheckStore(currentCheckNamespace, 'groups');
    for (var el in groupObjects) {
      groupObjects[el].currentGroupprogress = this.getGroupProgress(groupObjects[el]);
    }
    if (!groupObjects || !groupObjects[currentGroupIndex]) currentGroupIndex = 0;
    if (!subGroupObjects || !subGroupObjects[currentCheckIndex]) currentCheckIndex = 0;
    var subGroupObjects = null;
    try {
      subGroupObjects = groupObjects[currentGroupIndex]['checks'];
    } catch (e) {
      console.log("Its possible the tools data structure doesnt follow the groups and checks pattern");
    }
    let bookName = api.getDataFromCheckStore(currentCheckNamespace, 'book');
    //We are going to have to change the way we are handling the isCurrentItem, it does not need to be
    //attached to every menu/submenuitem
    this.setState(merge({}, this.state, {
      currentGroupIndex: currentGroupIndex || 0,
      currentCheckIndex: currentCheckIndex || 0,
      currentToolNamespace: currentCheckNamespace,
      currentGroupName: groupName,
      currentGroupObjects: groupObjects,
      currentSubGroupObjects: subGroupObjects,
      currentBookName: bookName,
    }), () => {
      this.state.menuHeadersProps.scrollToMenuElement(this.state.currentGroupIndex)
      this.updateTools(this.state.currentToolNamespace, () => {
        this.props.dispatch(showMainView(true));
      });
    });

  },

  getDefaultModules(callback) {
    var defaultModules = [];
    fs.ensureDirSync(PACKAGE_SUBMODULE_LOCATION);
    var moduleBasePath = PACKAGE_SUBMODULE_LOCATION;
    fs.readdir(moduleBasePath, function (error, folders) {
      if (error) {
        console.error(error);
      }
      else {
        for (var folder of folders) {
          try {
            var manifestPath = path.join(moduleBasePath, folder, 'package.json');
            var packageJson = require(manifestPath);
            var installedPackages = fs.readdirSync(moduleBasePath);
            if (packageJson.display === 'app') {
              var dependencies = true;
              for (var app in packageJson.include) {
                if (!installedPackages.includes(app)) {
                  dependencies = false;
                }
              }
              if (dependencies) {
                defaultModules.push(manifestPath);
              }
            }
          }
          catch (e) {
          }
        }
      }
      callback(defaultModules);
    });
  },
  sortMetadatas(metadatas) {
    metadatas.sort((a, b) => {
      return a.title < b.title ? -1 : 1;
    });
  },
  fillDefaultModules(moduleFilePathList, callback) {
    var tempMetadatas = [];
    //This makes sure we're done with all the files first before we call the callback
    var totalFiles = moduleFilePathList.length,
      doneFiles = 0;
    function onComplete() {
      doneFiles++;
      if (doneFiles == totalFiles) {
        callback(tempMetadatas);
      }
    }
    for (let filePath of moduleFilePathList) {
      fs.readJson(filePath, (error, metadata) => {
        if (error) {
          console.error(error);
        }
        else {
          metadata.folderName = path.dirname(filePath);
          metadata.imagePath = path.resolve(filePath, '../icon.png');
          tempMetadatas.push(metadata);
        }
        onComplete();
      });
    }
  },
  updateTools(namespace, callback) {
    if (!namespace) {
      this.getDefaultModules((moduleFolderPathList) => {
        this.fillDefaultModules(moduleFolderPathList, (metadatas) => {
          this.sortMetadatas(metadatas);
          api.putToolMetaDatasInStore(metadatas);
          this.setState(merge({}, this.state, {
            switchCheckProps: {
              moduleMetadatas: metadatas,
            },
            moduleWrapperProps: {
              type: 'recent',
              mainViewVisible: true
            },
            uploadProps: {
              active: 0
            }
          }), callback)
        })
      })
    } else {
      var newCheckCategory = api.getModule(namespace);
      this.setState(merge({}, this.state, {
        moduleWrapperProps: {
          type: 'main',
          mainTool: newCheckCategory
        }
      }), callback)
    }
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
        mainViewVisible: this.props.coreStoreReducer.mainViewVisible,
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
            var newuser = gogs(Token).login(userDataSumbit).then((userdata) => {
              CoreActions.login(userdata);
              this.props.dispatch(updateLoginModal(false));
              CoreActions.updateOnlineStatus(true);
              this.props.dispatch(updateProfileModal(true));
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
            this.props.dispatch(updateProfileModal(false));
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
          close: () => {
            this.props.dispatch(showLoginProfileModal(false));
          }
        },
        sideBarContainerProps: {
          SideNavBar: false,
          screenHeight: window.innerHeight,
          updateDimensions: () => {
            if (this.state.sideBarContainerProps.screenHeight != window.innerHeight) {
              this.setState(merge({}, this.state, {
                sideBarContainerProps: {
                  screenHeight: window.innerHeight
                }
              }));
            }
          },
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
            this.setState(merge({}, this.state, {
              sideBarContainerProps: {
                SideNavBar: !this.state.sideBarContainerProps.SideNavBar
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
              //this.updateTools(null);
              this.props.dispatch(showSwitchCheckModal(true));
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
            const Report = require("../components/core/reports/ReportGenerator");
            api.emitEvent('ReportVisibility', { 'visibleReport': 'true' });
          },
          handleChangeCheckCategory: () => {
            var dispatch = this.props.dispatch;
            if (api.getDataFromCommon('saveLocation') && api.getDataFromCommon('tcManifest')) {
              this.props.dispatch(showMainView(false));
            } else {
              api.Toast.info('Open a project first, then try again', '', 3);
              dispatch(showCreateProject("Languages"));
            }
          },
          handleSettings: () => {
            CoreActions.updateSettings(true);
          },
          handlePackageManager: () => {
            var PackageManagerView = require("../components/core/Package_Manager/PackageManagerView");
            ReactDOM.render(<PackageManagerView />, document.getElementById('package_manager'))
            api.emitEvent('PackManagerVisibility', { 'visiblePackManager': 'true' });
          }
        },
        menuHeadersProps: {
          scrollToMenuElement: (id, name) => {
            try {
              const groupName = name || this.state.currentGroupObjects[id].group;
              //ALSO GETTING NEW SUBMENU ITEMS ON A CHANGE OF MENU ITEMS
              var newGroupElement = this.refs.sidebar.refs.menuheaders.refs[`${groupName}`];
              //this ref may be here forever...sigh
              var element = api.findDOMNode(newGroupElement);
              if (element) {
                element.scrollIntoView();
              }
            } catch (e) {
              console.log(e);
              console.log("Its possible the tools data structure doesnt follow the groups and checks pattern");
            }
          },
          menuClick: (id) => {
            id = id >= 0 ? id : 0;
            id = id <= this.state.currentGroupObjects.length - 1 ? id : this.state.currentGroupObjects.length - 1;
            this.state.menuHeadersProps.scrollToMenuElement(id);
            this.state.menuHeadersProps.setIsCurrentCheck(true, id, () => {
              var currentCheck = this.state.currentGroupObjects[this.state.currentCheckIndex].checks[0];
              api.emitEvent('goToCheck', {
                chapterNumber: currentCheck.chapter,
                verseNumber: currentCheck.verse
              });
            });
          },
          setIsCurrentCheck: (status, id, callback) => {
            const newObj = this.state.currentGroupObjects.slice(0);
            const currentSubGroupObjects = newObj[id].checks;
            this.setState({
              currentGroupIndex: parseInt(id),
              currentSubGroupObjects: currentSubGroupObjects,
              currentCheckIndex: 0,
            }, callback);
          },
        },
        subMenuProps: {
          scrollToMenuElement: (id) => {
            try {
              var newGroupElement = this.refs.navmenu.refs.submenu.refs[`${this.state.currentGroupIndex} ${id}`];
              //this ref may be here forever...sigh
              var element = api.findDOMNode(newGroupElement);
              if (element) {
                element.scrollIntoView();
              }
            } catch (e) {
              console.log(e);
            }

          },
          checkClicked: (id) => {
            this.state.subMenuProps.scrollToMenuElement(id);
            this.state.subMenuProps.setIsCurrentCheck(true, id, () => {
              var currentCheck = this.state.currentGroupObjects[this.state.currentGroupIndex].checks[this.state.currentCheckIndex];
              api.emitEvent('goToCheck', {
                chapterNumber: currentCheck.chapter,
                verseNumber: currentCheck.verse
              });
            });
          },
          setIsCurrentCheck: (status, id, callback) => {
            this.setState({
              currentCheckIndex: parseInt(id),
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
            Upload.sendFilePath(path, link, callback);
          },
        },
        projectModalProps: {
          showModal: false,
          show: 'link',
          submitLink: (callback) => {
            var link = this.state.projectModalProps.link;
            loadOnline(link, function (err, savePath, url) {
              if (!err) {
                Upload.sendFilePath(savePath, url, callback);
              } else {
                console.error(err);
              }
            });
          },

          close: () => {
            this.props.dispatch(showCreateProject(false));
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

          onClick: (type) => {
            if (type == 'link') {
              this.state.projectModalProps.submitLink((err) => {
                if (!err) {
                  api.emitEvent('changeCheckType', { currentCheckNamespace: null });
                  api.emitEvent('newToolSelected', { 'newToolSelected': true });
                  this.state.projectModalProps.close();
                  api.Toast.info('Info:', 'Your project is ready to be loaded once you select a tool', 5);
                  this.props.dispatch(showMainView(true));
                  this.props.dispatch(showSwitchCheckModal(true));
                } else if (err != "") {
                  api.createAlert(
                    {
                      title: 'Error Setting Up Project',
                      content: err,
                      moreInfo: "",
                      leftButtonText: "Ok"
                    },
                    () => {
                    });
                }
              });
            }
            else if (type == 'usfm') {
              if (!this.state.importUsfmProps.usfmSave) {
                return;
              }
            } else {
              api.emitEvent('changeCheckType', { currentCheckNamespace: null });
              api.emitEvent('newToolSelected', { 'newToolSelected': true });
              this.state.projectModalProps.close();
              api.Toast.info('Info:', 'Your project is ready to be loaded once you select a tool', 5);
              this.props.dispatch(showMainView(true));
              this.props.dispatch(showSwitchCheckModal(true));
            }
          },
          _handleKeyPress: (e, type) => {
            if (e.key === 'Enter') {
              this.state.projectModalProps.onClick(type);
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
              case 5:
                this.setState(merge({}, this.state, {
                  projectModalProps: {
                    show: 'recent',
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
                Upload.sendFilePath(savePath, url, () => {
                  dispatch(showCreateProject(false));
                })
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
          close: () => {
            this.props.dispatch(showSwitchCheckModal(false));
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

                CheckDataGrabber.loadModuleAndDependencies(folderName);
                localStorage.setItem('lastCheckModule', folderName);
              } else {
                console.error(err);
              }
            });
            this.props.dispatch(showMainView(false));
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
        },
        moduleWrapperProps: {
          mainTool: null,
          type: ''
        },
        switchCheckProps: {
          moduleMetadatas: [],
          moduleClick: (folderName) => {
            this.props.dispatch(showMainView(false));
            this.props.dispatch(showSwitchCheckModal(false));
            if (api.getDataFromCommon('saveLocation') && api.getDataFromCommon('tcManifest')) {
              CheckDataGrabber.loadModuleAndDependencies(folderName);
              localStorage.setItem('lastCheckModule', folderName);
            } else {
              api.Toast.error('No save location selected', '', 3);
              return;
            }
          },
        },
        recentProjectsProps: {
          onLoad: (filePath) => {
            Upload.sendFilePath(filePath, undefined, (err) => {
              if (!err) this.state.projectModalProps.onClick();
              api.putDataInCommon('saveLocation', filePath);
            });
          },
          projects: fs.readdirSync(defaultSave),
          showFolder: shell.showItemInFolder
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
    window.addEventListener("resize", this.state.sideBarContainerProps.updateDimensions);
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
      gogs(Token).login(userdata).then((userdata) => {
        CoreActions.login(userdata);
        CoreActions.updateOnlineStatus(true);
        this.props.dispatch(updateProfileModal(true));
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
      Upload.sendFilePath(saveLocation, null, (err) => {
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
          <LoginModal {...this.props.modalReducers.login_profile} loginProps={this.state.loginProps} profileProps={this.state.profileProps} profileProjectsProps={this.state.profileProjectsProps} {...this.state.loginModalProps} />
          <ProjectModal {...this.props.loginModalReducer} {...this.state.projectModalProps} uploadProps={this.state.uploadProps} importUsfmProps={this.state.importUsfmProps} dragDropProps={this.state.dragDropProps} profileProjectsProps={this.state.profileProjectsProps} recentProjectsProps={this.state.recentProjectsProps} />
          <SideBarContainer ref='sidebar' isCurrentHeader={this.state.currentGroupIndex} {...this.state} {...this.state.sideBarContainerProps} menuClick={this.state.menuHeadersProps.menuClick} {...this.state.sideNavBarProps} />
          <StatusBar />
          <SwitchCheckModal {...this.state.switchCheckModalProps} {...this.props.modalReducers.switch_check}>
            <SwitchCheck {...this.state.switchCheckProps} />
          </SwitchCheckModal>
          <Popover />
          <Toast />
          <Grid fluid className='fill-height' style={{ marginLeft: '100px', paddingTop: "30px", paddingRight: "0px" }}>
            <Row className='fill-height main-view'>
              <Col className='fill-height' xs={5} sm={4} md={3} lg={2} style={{ padding: "0px", backgroundColor: "#747474", overflowY: "auto", overflowX: "hidden" }}>
                <NavMenu ref='navmenu' {...this.state} isCurrentSubMenu={this.state.currentCheckIndex} />
              </Col>
              <Col style={RootStyles.ScrollableSection} xs={7} sm={8} md={9} lg={10}>
                <Loader {...this.state.loaderModalProps} />
                <AlertModal {...this.state.alertModalProps} />
                <ModuleWrapper mainViewVisible={this.props.coreStoreReducer.mainViewVisible} {...this.state.moduleWrapperProps} switchCheckProps={this.state.switchCheckProps} recentProjectsProps={this.state.recentProjectsProps} />
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
