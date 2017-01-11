const React = require('react');
const Path = require('path');
const pathex = require('path-extra');
const PARENT = pathex.datadir('translationCore');
const PACKAGE_COMPILE_LOCATION = pathex.join(PARENT, 'packages-compiled')

const api = window.ModuleApi;
const fs = require(window.__base + 'node_modules/fs-extra');
const AppDescription = require('./AppDescription');

const CoreStore = require('../../stores/CoreStore.js');
const CoreActions = require('../../actions/CoreActions.js');
const CheckDataGrabber = require('./create_project/CheckDataGrabber.js');

/**
 * @description - This returns a list of module's which have manifest files within their
 * main folder. All of these modules are located in the window.__base + 'modules/' folder
 * within the repository
 * @param {function} callback - callback that will be called with an array of folder paths to
 * modules that contain 'manifest.json' files
 */
function getDefaultModules(callback) {
  var defaultModules = [];
  fs.ensureDirSync(PACKAGE_COMPILE_LOCATION);
  var moduleBasePath = PACKAGE_COMPILE_LOCATION;
  fs.readdir(moduleBasePath, function(error, folders) {
    if (error) {
      console.error(error);
    }
    else {
      for (var folder of folders) {
        try {
          var manifestPath = Path.join(moduleBasePath, folder, 'package.json');
          var packageJson = require(manifestPath);
          if (packageJson.display === 'app') {
            defaultModules.push(manifestPath);
          }
        }
        catch(e) {

        }
      }
    }
    callback(defaultModules);
  });
}

class SwitchCheck extends React.Component{
  constructor(){
    super();
    this.state = {
      showModal: false,
      moduleMetadatas: []
    }
  }

  componentWillMount() {
    var _this = this;
    getDefaultModules((moduleFolderPathList) => {
      _this.fillDefaultModules(moduleFolderPathList, (metadatas) => {
        _this.sortMetadatas(metadatas);
        _this.setState({
          moduleMetadatas: metadatas
        });
        api.putToolMetaDatasInStore(metadatas);
      });
    });
  }


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

    for(let filePath of moduleFilePathList) {
      fs.readJson(filePath, (error, metadata) => {
        if (error) {
          console.error(error);
        }
        else {
          metadata.folderName = Path.dirname(filePath);
          metadata.imagePath = Path.resolve(filePath, '../icon.png');
          tempMetadatas.push(metadata);
        }
        onComplete();
      });
    }
  }

  // Sorts check apps by their 'title' properties from their manifest files
  sortMetadatas(metadatas) {
    metadatas.sort((a, b) => {
      return a.title < b.title ? -1 : 1;
    });
  }

  moduleClick(folderName) {
    CoreActions.updateCheckModal(false);
    if (api.getDataFromCommon('saveLocation') && api.getDataFromCommon('tcManifest')) {
      CheckDataGrabber.loadModuleAndDependencies(folderName);
      localStorage.setItem('lastCheckModule', folderName);
    } else {
      api.Toast.error('No save location selected', '', 3);
      return;
    }
  }

  render() {
    var buttons = [];
    if(this.state.moduleMetadatas.length == 0) {
      return <div>No tC default modules found.</div>;
    }
    else {
      for (var i in this.state.moduleMetadatas) {
        const metadata = this.state.moduleMetadatas[i];
        buttons.push(<AppDescription key={i}
                          imagePath={metadata.imagePath}
                          title={metadata.title}
                          description={metadata.description}
                          useApp={this.moduleClick.bind(this)}
                          folderName={metadata.folderName}
          />)
      }
    }
    return (
      <div>
          {buttons}
      </div>
    );
  }
}
module.exports = SwitchCheck;
