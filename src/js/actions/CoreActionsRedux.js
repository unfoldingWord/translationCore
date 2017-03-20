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

module.exports.changeOnlineStatus = function (online, firstLoad, fromButton) {
  return ((dispatch) => {
    if (!document.hasFocus() && !fromButton) return;
    //If the document is out of focus and the action is not created by the user
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
      if (!currentCheckNamespace) return {
        type: "SET_TOOL_NAMESPACE"
      };
      //if for some reason currentCheckNamespace is undefined it shouldn't continue
      const store = api.getDataFromCheckStore(currentCheckNamespace);
      var bookName = store.book;
      var currentGroupIndex = store.currentGroupIndex;
      var currentCheckIndex = store.currentCheckIndex;
      var groupObjects = store.groups;
      var groupName = groupObjects[currentGroupIndex].group;
      var currentCheck;
      var subGroupObjects;

      //getting the data required to initialize a new tool being loaded

      if (currentCheckNamespace === ' ') {
        dispatch(this.changeModuleView('recent'));
        dispatch(CheckStoreActions.setBookName(null));
        dispatch(CheckStoreActions.setCheckNameSpace(null));
        return {
          type: "SET_TOOL_NAMESPACE"
        };
      }
      //if currentCheckNamespace is ' ' that means we are showing the recent projects and not a tool

      dispatch(CheckStoreActions.setCheckNameSpace(currentCheckNamespace));
      //populating the checkstore field for namespace

      if (!groupObjects[currentGroupIndex]) currentGroupIndex = 0;
      this.setUpGroupObjects(groupObjects);

      if (!subGroupObjects || !subGroupObjects[currentCheckIndex]) currentCheckIndex = 0;

      try {
        subGroupObjects = groupObjects[currentGroupIndex]['checks'];
        currentCheck = subGroupObjects[currentCheckIndex];
      } catch (e) {
        console.log("Its possible the tools data structure doesnt follow the groups and checks pattern");
      }

      dispatch(CheckStoreActions.setBookName(bookName));
      //populating the checkstore field for bookName

      dispatch(CheckStoreActions.setGroupsObjects(groupObjects));
      //populating the checkstore field for groupobjects

      dispatch(CheckStoreActions.goToCheck(currentCheckNamespace, currentGroupIndex || 0, currentCheckIndex || 0));
      //populating the checkstore field for namespace

      dispatch(CheckStoreActions.updateCurrentCheck(currentCheckNamespace, currentCheck));
      //populating the checkstore field for the currentCheck, a tool may have a
      //prior checkindex and group index

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

      dispatch(this.changeModuleView('main'));
      //updating the current view of the app
    })
  }

module.exports.setUpGroupObjects = function (groupObjects) {
  for (var el in groupObjects) {
    groupObjects[el].currentGroupprogress = this.getGroupProgress(groupObjects[el]);
  }

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