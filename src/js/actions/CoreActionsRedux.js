var consts = require('./CoreActionConsts');
var Path = require('path');
const pathex = require('path-extra');
var fs = require(window.__base + 'node_modules/fs-extra');
const exec = require('child_process').exec;
var sudo = require('sudo-prompt');
var options = {
  name: 'Translation Core'
};
const PACKAGE_SUBMODULE_LOCATION = pathex.join(window.__base, 'tC_apps');
const CheckStoreActions = require('./CheckStoreActions.js');
const ToolsActions = require('./ToolsActions.js');
const api = window.ModuleApi;

/**
How to use the actions:
Just require this file in your component, call
one of the functions and the event will automatically
be dispatched to all of the stores that have registered
listener
(See ExampleComponent.js)
*/

module.exports.showMainView = function (val) {
  return {
    type: consts.SHOW_APPS,
    val: val
  }
}

module.exports.changeModuleView = function (val) {
  return {
    type: consts.CHANGE_WRAPPER_VIEW,
    val: val
  }
}

module.exports.changeOnlineStatus = function (online, firstLoad) {
  return ((dispatch) => {
    if (process.platform == 'win32') {
      var TCportAllowed = true;
      if (firstLoad) {
        exec(`netsh advfirewall firewall show rule name="block tc out"`, options, function (error, stdout, stderror) {
          if (!error) {
            stdout = stdout.replace(/ /g, '');
            TCportAllowed = !stdout.includes("Enabled:Yes");
          }
          dispatch({
            type: "CHANGE_ONLINE_STATUS",
            online: TCportAllowed
          });
          return;
        })
      } else {
        if (online) {
          sudo.exec(`netsh advfirewall firewall delete rule name="block tc in" && netsh advfirewall firewall delete rule name="block tc out"`, options, function (error, stdout, stderror) {
            dispatch({
              type: "CHANGE_ONLINE_STATUS",
              online: online
            })
          })
        }
        else {
          exec(`wmic process where processId=${process.pid} get ExecutablePath`, options, function (error, execPath, stderror) {
            execPath = execPath.replace(/\r?\n|\r|\s|ExecutablePath/g, '');
            sudo.exec(`netsh advfirewall firewall add rule name="block tc in" dir=in program="${execPath}" action=block && netsh advfirewall firewall add rule name="block tc out" dir=out program="${execPath}" action=block`, options, () => {
              dispatch({
                type: "CHANGE_ONLINE_STATUS",
                online: online
              });
            });
          });
        }
      }
    } else {
      if (online == window.navigator.onLine && firstLoad) {
        dispatch({
          type: "CHANGE_ONLINE_STATUS",
          online: online
        });
        return;
      }
      if (online) {
        exec('networksetup -setairportpower en1 on', function (cp) {
          dispatch({
            type: "CHANGE_ONLINE_STATUS",
            online: online
          })
        });
      } else {
        exec('networksetup -setairportpower en1 off', function (cp) {
          dispatch({
            type: "CHANGE_ONLINE_STATUS",
            online: online
          })
        });
      }
    }
  })
}

module.exports.loadModuleAndDependencies = function (currentCheckNamespace) {
  return ((dispatch) => {
    var reports = [];
    fs.readdir(PACKAGE_SUBMODULE_LOCATION, (err, modules) => {
      for (var module of modules) {
        try {
          let aReportView = require(Path.join(PACKAGE_SUBMODULE_LOCATION, module, "ReportView.js"));
          reports.push(aReportView);
        } catch (e) {
        }
      }
      dispatch({
        type: consts.DONE_LOADING,
        doneLoading: true,
        reportViews: reports,
        currentCheckNamespace: currentCheckNamespace
      })
      dispatch(this.setToolNamespace(currentCheckNamespace))
    });
  });
}

module.exports.changeSubMenuItems = function (groupName) {
  const newSubGroupObjects = this.getSubMenuItems(this.state.currentToolNamespace, groupName);
  this.setState({
    currentSubGroupObjects: newSubGroupObjects,
    currentGroupName: groupName,
    currentCheckIndex: 0
  });
},

  module.exports.setToolNamespace = function (currentCheckNamespace) {
    return ((dispatch, getState) => {
      // const store = getState().checkStoreReducer;
      // var groupName = store.groupName;
      // var bookName = store.bookName;
      // var currentGroupIndex = store.currentGroupIndex;
      // var currentCheckIndex = store.currentCheckIndex;
      // var groupObjects = store.groups;
      // var subGroupObjects = store.subgroups;
      //can be refactored when api.putDataInCheckStore is finished
      if (!currentCheckNamespace) return {
        type: "SET_TOOL_NAMESPACE"
      };
      const store = api.getDataFromCheckStore(currentCheckNamespace);
      var bookName = store.book;
      var currentGroupIndex = store.currentGroupIndex;
      var currentCheckIndex = store.currentCheckIndex;
      var groupObjects = store.groups;
      var groupName = groupObjects[currentGroupIndex].group;

      if (currentCheckNamespace === ' ') {
        dispatch(this.changeModuleView('recent'));
        dispatch(CheckStoreActions.setBookName(null));
        dispatch(CheckStoreActions.setCheckNameSpace(null));
        return;
      }
      dispatch(CheckStoreActions.setCheckNameSpace(currentCheckNamespace));

      for (var el in groupObjects) {
        groupObjects[el].currentGroupprogress = this.getGroupProgress(groupObjects[el]);
      }
      if (!groupObjects || !groupObjects[currentGroupIndex]) currentGroupIndex = 0;
      if (!subGroupObjects || !subGroupObjects[currentCheckIndex]) currentCheckIndex = 0;
      var subGroupObjects = null;
      var currentCheck = null;
      try {
        subGroupObjects = groupObjects[currentGroupIndex]['checks'];
        currentCheck = subGroupObjects[currentCheckIndex]
      } catch (e) {
        console.log("Its possible the tools data structure doesnt follow the groups and checks pattern");
      }
      dispatch(CheckStoreActions.setBookName(bookName));
      dispatch(CheckStoreActions.setGroupsObjects(groupObjects));
      dispatch(CheckStoreActions.goToCheck(currentCheckNamespace, currentGroupIndex || 0, currentCheckIndex || 0));
      dispatch(CheckStoreActions.updateCurrentCheck(currentCheckNamespace, currentCheck));
      //We are going to have to change the way we are handling the isCurrentItem, it does not need to be
      //attached to every menu/submenuitem
      dispatch({
        type: "SET_TOOL_NAMESPACE",
        currentGroupIndex: currentGroupIndex || 0,
        currentCheckIndex: currentCheckIndex || 0,
        currentToolNamespace: currentCheckNamespace,
        currentGroupName: groupName,
        currentGroupObjects: groupObjects,
        currentSubGroupObjects: subGroupObjects,
        currentBookName: bookName,
      });
      dispatch(ToolsActions.getToolsMetadatas());
      //dispatch(this.showMainView(true));
      dispatch(this.changeModuleView('main'));
    })
  }


module.exports.updateTools = function (namespace) {
  //TODO
  return ((dispatch) => {
    if (!namespace) {
      this.getDefaultModules((moduleFolderPathList) => {
        this.fillDefaultModules(moduleFolderPathList, (metadatas) => {
          this.sortMetadatas(metadatas);
          api.putToolMetaDatasInStore(metadatas);
          this.props.updateModuleView('recent');
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
  });
}

module.exports.getGroupProgress = function (groupObj) {
  var numChecked = 0;
  for (var i = 0; i < groupObj.checks.length; i++) {
    if (groupObj.checks[i].checkStatus != "UNCHECKED") numChecked++;
  }
  return numChecked / groupObj.checks.length;
}

module.exports.getAlert = function () {
  var data = CoreStore.getAlertResponseMessage();
  if (data) {
    try {
      var callback = this.alertObj['alertCallback'];
      callback(data);
      this.alertObj['alertCallback'] = null;
      api.clearAlertCallback();
    }
    catch (e) {
    }
    data = null;
    this.alertResponseObj = null;
  }
}