//SwitchCheckModal.js//
/**
 * @description - This file describes the modal that lists out the available modules that a
 * checker may choose to check
 * @author: Logan Lebanoff
 */

 //node module imports
const React = require('react');
const Path = require('path');
const fs = require(window.__base + 'node_modules/fs-extra');

//bootstrap imports
const Button = require('react-bootstrap/lib/Button.js');
const Modal = require('react-bootstrap/lib/Modal.js');

//locally defined imports
const CoreStore = require('../../stores/CoreStore.js');
const CoreActions = require('../../actions/CoreActions.js');
const CheckDataGrabber = require('./create_project/CheckDataGrabber.js');
const AppDescription = require('./AppDescription');
const api = window.ModuleApi;

class SwitchCheck extends React.Component{
  constructor(){
    super();
    this.state ={
      showModal: false,
      moduleMetadatas: []
    }
  }

  componentWillMount() {
    var _this = this;
    this.getDefaultModules((moduleFolderPathList) => {
      _this.fillDefaultModules(moduleFolderPathList, (metadatas) => {
        _this.sortMetadatas(metadatas);
        _this.setState({moduleMetadatas: metadatas});
      });
    });
  }

  /**
   * @description - This returns a list of module's which have manifest files within their
   * main folder. All of these modules are located in the window.__base + 'modules/' folder
   * within the repository
   * @param {function} callback - callback that will be called with an array of folder paths to
   * modules that contain 'manifest.json' files
   */
  getDefaultModules(callback) {
    var defaultModules = [];
    var moduleBasePath = Path.join(window.__base, 'modules');
    fs.readdir(moduleBasePath, function(error, folders) {
      if (error) {
        console.error(error);
      }
      else {
        for (var folder of folders) {
          try {
            var manifestPath = Path.join(moduleBasePath, folder, 'manifest.json');
            fs.accessSync(manifestPath);
            defaultModules.push(manifestPath);

          }
          catch(e) {

          }
        }
      }
      callback(defaultModules);
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
      CoreActions.startLoading();
      CheckDataGrabber.loadModuleAndDependencies(folderName);
      localStorage.setItem('lastCheckModule', folderName);
    } else {
      api.Toast.error('No save location selected', '', 3);
      return;
    }
  }

  render() {
    var buttons;
    if(!this.state.moduleMetadatas || this.state.moduleMetadatas.length == 0) {
      buttons = <div>No tC default modules found.</div>;
    }
    else {
      var key = 0;
      buttons = this.state.moduleMetadatas.map((metadata) => {
        return (
          <AppDescription key={key++}
                          imagePath={metadata.imagePath}
                          title={metadata.title}
                          description={metadata.description}
                          useApp={this.moduleClick.bind(this)}
                          folderName={metadata.folderName}
          />
        );
      });
    }
    exports.buttons = buttons;
    return (
      <div>
        {buttons}
      </div>
    );
  }
}

class SwitchCheckModal extends React.Component {
  constructor(){
    super();
    this.state ={
      showModal: false,
    }
    this.updateCheckModal = this.updateCheckModal.bind(this);
  }

  updateCheckModal() {
    this.setState({showModal: CoreStore.getCheckModal()});
  }

  close() {
    CoreActions.updateCheckModal(false);
  }

  componentWillMount() {
    CoreStore.addChangeListener(this.updateCheckModal);
  }

  componentWillUnmount() {
    CoreStore.removeChangeListener(this.updateCheckModal);
  }

  render() {
    return (
      <div>
        <Modal show={this.state.showModal} onHide={this.close}>
          <Modal.Header closeButton>
            <Modal.Title>Change Tool Check category</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <SwitchCheck />
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.close}>Close</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

exports.Component = SwitchCheck;
exports.Modal = SwitchCheckModal
