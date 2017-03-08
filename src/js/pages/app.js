const React = require('react');
const ReactDOM = require('react-dom');
const CoreActions = require('../actions/CoreActions.js');
const recentProjectActions = require('../actions/RecentProjectsActions.js');
const CoreActionsRedux = require('../actions/CoreActionsRedux.js');
const modalActions = require('../actions/ModalActions.js');
const CheckStore = require('../stores/CheckStore.js');
const { connect  } = require('react-redux');
const pathex = require('path-extra');
const PARENT = pathex.datadir('translationCore');
const PACKAGE_SUBMODULE_LOCATION = pathex.join(window.__base, 'tC_apps');
const bootstrap = require('react-bootstrap');
const CryptoJS = require("crypto-js");
const gogs = require('../components/core/login/GogsApi.js');
const sync = require('../components/core/SideBar/GitSync.js');
const remote = require('electron').remote;
const {dialog} = remote;
const path = require('path-extra');
const defaultSave = path.join(path.homedir(), 'translationCore');
const {shell} = require('electron');
const fs = require(window.__base + 'node_modules/fs-extra');

const merge = require('lodash.merge');
const StatusBarContainer = require('../containers/StatusBarContainer');
const SideBarContainer = require('../containers/SideBarContainer');
const Gogs = require('../components/core/login/GogsApi')();
const ImportUsfm = require('../components/core/Usfm/ImportUSFM.js');
const SwitchCheck = require('../components/core/SwitchCheck');
const Loader = require('../components/core/Loader');
const RootStyles = require('./RootStyle');
const Grid = require('react-bootstrap/lib/Grid.js');
const Button = require('react-bootstrap/lib/Button.js');
const Row = require('react-bootstrap/lib/Row.js');
const Col = require('react-bootstrap/lib/Col.js');
const ModuleProgress = require('../components/core/ModuleProgress/ModuleProgressBar')
const CheckDataGrabber = require('../components/core/create_project/CheckDataGrabber.js');
const loadOnline = require('../components/core/LoadOnline');
const RecentProjects = require('../components/core/RecentProjects');
const Welcome = require('../components/core/welcome/welcome');
const AlertModal = require('../components/core/AlertModal');
const Access = require('../components/core/AccessProject.js');
const api = window.ModuleApi;
const ModuleWrapperContainer = require('../containers/ModuleWrapperContainer');
const CoreStore = require('../stores/CoreStore.js');
const Popover = require('../components/core/Popover');
const Upload = require('../components/core/UploadMethods.js');
const ModalContainer = require('../containers/ModalContainer.js');
const ToolsActions = require('../actions/ToolsActions.js');
const CheckStoreActions = require('../actions/CheckStoreActions.js');
const LoaderActions = require('../actions/LoaderActions.js');
const SettingsActions = require('../actions/SettingsActions.js');
const DragDropActions = require('../actions/DragDropActions.js');
import NotificationContainer from '../containers/NotificationContainer';
import { showNotification } from '../actions/NotificationActions.js'

var Main = React.createClass({
  componentWillMount() {
    //initializing app settings
    const tCDir = path.join(pathex.homedir(), 'translationCore');
    fs.ensureDirSync(tCDir);
    this.updateTools();
    this.props.dispatch(recentProjectActions.getProjectsFromFolder());
    api.registerEventListener('changeCheckType', this.setCurrentToolNamespace);
    //changing check, (group index, check index) ...one or the other or both
    api.registerEventListener('changeGroupName', this.changeSubMenuItems);
    //changing just the group index
    api.registerEventListener('changedCheckStatus', this.changeSubMenuItemStatus);
    var online = window.navigator.onLine;
    this.props.changeOnlineStatus(online, true);
  },

  componentWillUnmount() {
    window.removeEventListener('resize', this.state.sideBarContainerProps.updateDimensions);
    api.removeEventListener('changeCheckType', this.setCurrentToolNamespace);
    api.removeEventListener('changeGroupName', this.changeSubMenuItems);
    api.removeEventListener('changedCheckStatus', this.changeSubMenuItemStatus);
  },
  
  changeSubMenuItemStatus({groupIndex, checkIndex, checkStatus}) {
    let groupObjects = this.props.checkStoreReducer.groups;
    let currentGroupIndex = this.props.checkStoreReducer.currentGroupIndex;
    let currentCheckIndex = this.props.checkStoreReducer.currentCheckIndex;
    let currentSubGroupObjects;
    if (currentGroupIndex != null && groupObjects != null) {
      currentSubGroupObjects = groupObjects[currentGroupIndex]['checks'];
    }
    const newSubGroupObjects = currentSubGroupObjects.slice(0);
    newSubGroupObjects[currentCheckIndex].checkStatus = checkStatus;
    const newGroupObjects = groupObjects.slice(0);
    newGroupObjects[currentGroupIndex].checks = newSubGroupObjects;
    newGroupObjects[currentGroupIndex].currentGroupprogress = this.getGroupProgress(newGroupObjects[currentGroupIndex]);
    api.putDataInCheckStore(this.state.currentToolNamespace, 'groups', newGroupObjects);
    this.props.dispatch(CheckStoreActions.setGroupsObjects(newGroupObjects));
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

  setCurrentToolNamespace({currentCheckNamespace}) {
    if (!currentCheckNamespace) return;
    if (currentCheckNamespace === ' ') {
      this.setState({
        currentToolNamespace: null,
      });
      this.props.dispatch(CoreActionsRedux.changeModuleView('recent'));
      this.props.dispatch(CheckStoreActions.setBookName(null));
      this.props.dispatch(CheckStoreActions.setCheckNameSpace(null));
      return;
    }
    this.props.dispatch(CheckStoreActions.setCheckNameSpace(currentCheckNamespace));
    var groupName = this.state.currentGroupName;
    let bookName = api.getDataFromCheckStore(currentCheckNamespace, 'book');
    var currentGroupIndex = 0;
    var currentCheckIndex = 0;
    //switched Tool therefore generate New MenuHeader
    /*first load of fresh project thus no groupName
    * in checkstore then get groupName at groupindex 0
    */
    if (currentCheckNamespace && !groupName) {
      currentGroupIndex = api.getDataFromCheckStore(currentCheckNamespace, 'currentGroupIndex');
      currentCheckIndex = api.getDataFromCheckStore(currentCheckNamespace, 'currentCheckIndex');
      if (currentGroupIndex && currentCheckIndex) {
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
    /*
    Temporary code below to initializes the new checkStoreReducer
    */
    groupObjects = api.getDataFromCheckStore(currentCheckNamespace, 'groups');
    currentGroupIndex = api.getDataFromCheckStore(currentCheckNamespace, 'currentGroupIndex');
    currentCheckIndex = api.getDataFromCheckStore(currentCheckNamespace, 'currentCheckIndex');
    let currentCheck = groupObjects[currentGroupIndex]['checks'][currentCheckIndex];
    this.props.dispatch(CheckStoreActions.setBookName(bookName));
    this.props.dispatch(CheckStoreActions.setGroupsObjects(groupObjects));
    this.props.dispatch(CheckStoreActions.goToCheck(currentCheckNamespace, currentGroupIndex || 0, currentCheckIndex || 0));
    this.props.dispatch(CheckStoreActions.updateCurrentCheck(currentCheckNamespace, currentCheck));
    //We are going to have to change the way we are handling the isCurrentItem, it does not need to be
    //attached to every menu/submenuitem
    this.setState({
      currentGroupIndex: currentGroupIndex || 0,
      currentCheckIndex: currentCheckIndex || 0,
      currentToolNamespace: currentCheckNamespace,
      currentGroupName: groupName,
      currentGroupObjects: groupObjects,
      currentSubGroupObjects: subGroupObjects,
      currentBookName: bookName,
    }, () => {
      this.updateTools(this.state.currentToolNamespace, () => {
        this.props.showMainView(true);
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
          metadata.badgeImagePath = path.resolve(filePath, '../badge.png');
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
          this.props.updateModuleView('recent');
          this.setState(merge({}, this.state, {
            switchCheckProps: {
              moduleMetadatas: metadatas,
            },
            moduleWrapperProps: {
              mainViewVisible: true
            },
            uploadProps: {
              active: 1
            }
          }), callback)
        })
      })
    } else {
      var newCheckCategory = api.getModule(namespace);
      this.props.updateModuleView('main');
      this.setState(merge({}, this.state, {
        moduleWrapperProps: {
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
        subMenuOpen: true,
        mainViewVisible: this.props.coreStoreReducer.mainViewVisible,
        currentToolNamespace: null,
        currentGroupName: null,
        sideBarContainerProps: {
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
            //CoreActions.sendAlertResponse will need to be refactored out eventually, may be one of the harder functions to fix
          },

          handleAlertOK: () => {
            var response = this.state.alertModalProps.rightButtonText;
            this.setState(merge({}, this.state, {
              switchCheckModalProps: {
                visibility: false,
                alertMessage: {}
              }
            }), CoreActions.sendAlertResponse(response));
            //CoreActions.sendAlertResponse will need to be refactored out eventually, may be one of the harder functions to fix
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
          killLoading: () => {
            Upload.clearPreviousData();
            this.props.toggleLoaderModal();
            this.props.showProjectsInModal(true);
          },
          update: () => {
            if (CoreStore.doneLoading === this.props.loaderReducer.show) {
              if (!CoreStore.doneLoading) {
                setTimeout(() => {
                  this.setState(merge({}, this.state, {
                    loaderModalProps: {
                      reloadContent: <h3>Taking too long? <a onClick={this.state.loaderModalProps.killLoading}>Cancel loading</a></h3>
                    }
                  }));
                }, 10000);
              }
              this.setState(merge({}, this.state, {
                loaderModalProps: {
                  progress: CoreStore.getProgress(),
                  reloadContent: null
                }
              }));
              this.props.toggleLoaderModal();
            }
          },
        },
        moduleWrapperProps: {
          mainTool: null,
          type: 'recent'
        },
        switchCheckProps: {
          moduleMetadatas: [],
          moduleClick: (folderName) => {
            this.props.showMainView(false);
            this.props.showToolsInModal(false);
            if (api.getDataFromCommon('saveLocation') && api.getDataFromCommon('tcManifest')) {
              CheckDataGrabber.loadModuleAndDependencies(folderName);
              localStorage.setItem('lastCheckModule', folderName);
            } else {
              dispatch(showNotification('No save location selected', 3));
              return;
            }
          },
        },
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
    var packageJson = require(window.__base + '/package.json');
    if (localStorage.getItem('version') !== packageJson.version) {
      localStorage.removeItem('lastProject');
      localStorage.removeItem('lastCheckModule');
      localStorage.setItem('version', packageJson.version);
    }
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
        this.props.dispatch({
          type: "RECEIVE_LOGIN",
          val: userdata
        });
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
    try {
      if (api.getSettings('tutorialView') !== 'show' && saveLocation) {
        var lastProjectFiles = fs.readdirSync(saveLocation);
        this.props.sendFilePath(saveLocation, null, (err) => {
          var lastCheckModule = localStorage.getItem('lastCheckModule');
          if (lastCheckModule) {
            this.props.startLoadingNewProject(lastCheckModule);
          }
        });
      }
    } catch (e) {
      var splitArr = e.path.split("/");
      api.createAlert(
        {
          title: 'Error Opening Last Project',
          content: `Last project ${splitArr[splitArr.length - 1]} was not found.`,
          moreInfo: e,
          leftButtonText: "Ok"
        },
        () => {
          localStorage.removeItem('lastProject');
        });
    }

  },

  componentDidUpdate: function (prevProps, prevState) {
    if (this.showCheck == true) {
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
          <ModalContainer />
          <Popover />
          <NotificationContainer />
          <Grid fluid style={{ padding: 0 }}>
            <Row style={{ margin: 0 }}>
              <StatusBarContainer />
            </Row>
            <Col className="col-fluid" xs={1} sm={2} md={3} lg={3.5} style={{ padding: 0, width: "300px" }}>
              <SideBarContainer
                {...this.state.sideBarContainerProps}
                currentToolNamespace={this.state.currentToolNamespace}
              />
            </Col>
            <Col style={RootStyles.ScrollableSection} xs={7} sm={8} md={9} lg={9.5}>
              <Loader {...this.state.loaderModalProps} showModal={this.props.loaderReducer.show} />
              <AlertModal {...this.state.alertModalProps} />
              <ModuleWrapperContainer
                {...this.state.moduleWrapperProps}
                mainTool={this.state.moduleWrapperProps.mainTool}
                type={this.props.coreStoreReducer.type}
                mainViewVisible={this.props.coreStoreReducer.mainViewVisible}
                switchCheckProps={this.state.switchCheckProps}
                recentProjectsProps={this.props.recentProjectsReducer}
              />
            </Col>
          </Grid>
        </div>
      )
    }
  }
});

const mapDispatchToProps = (dispatch, ownProps) => {
  return merge({}, { dispatch: dispatch }, {
    getToolsMetadatas: () => {
      dispatch(ToolsActions.getToolsMetadatas());
    },
    handleLoadTool: (toolFolderPath) => {
      dispatch(ToolsActions.loadTool(toolFolderPath));
    },
    showLoad: () => {
      dispatch(modalActions.selectModalTab(2))
    },
    showToolsInModal: (visible) => {
      if (visible) {
        dispatch(modalActions.showModalContainer(true));
        dispatch(modalActions.selectModalTab(3))
      } else {
        dispatch(modalActions.showModalContainer(false));
      }
    },
    showProjectsInModal: (visible) => {
      if (visible) {
        dispatch(modalActions.showModalContainer(true));
        dispatch(modalActions.selectModalTab(2))
      } else {
        dispatch(modalActions.showModalContainer(false));
      }
    },
    openModalAndSpecificTab: (visible, tabkey, sectionKey) => {
      dispatch(modalActions.showModalContainer(true));
      dispatch(modalActions.selectModalTab(tabkey, sectionKey));
    },
    updateModuleView: (type) => {
      dispatch(CoreActionsRedux.changeModuleView(type));
    },
    toggleLoaderModal: () => {
      dispatch(LoaderActions.toggleLoader());
    },
    changeOnlineStatus: (val, first) => {
      dispatch(CoreActionsRedux.changeOnlineStatus(val, first));
    },
    sendFilePath: (filePath, link, callback) => {
      dispatch(DragDropActions.sendFilePath(filePath, link, callback));
    },
    startLoadingNewProject: (lastCheckModule) => {
      dispatch(recentProjectActions.startLoadingNewProject(lastCheckModule));
    },
    showMainView: (val) => {
      dispatch(CoreActionsRedux.showMainView(val));
    }
  });
}

function mapStateToProps(state) {
  //This will come in handy when we separate corestore and checkstore in two different reducers
  //Object.assign({}, state, state.coreStoreReducer)
  return state;
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(Main);
