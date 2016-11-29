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
const Panel = require('react-bootstrap/lib/Panel.js');

//locally defined imports
const CoreStore = require('../../stores/CoreStore.js');
const CoreActions = require('../../actions/CoreActions.js');
const CheckDataGrabber = require('./create_project/CheckDataGrabber.js');
const AppDescription = require('./AppDescription');
const api = window.ModuleApi;
const pathex = require('path-extra');
const PARENT = pathex.datadir('translationCore')
const PACKAGE_COMPILE_LOCATION = pathex.join(PARENT, 'packages-compiled')

/**
 * @description - This returns a list of module's which have manifest files within their
 * main folder. All of these modules are located in the window.__base + 'modules/' folder
 * within the repository
 * @param {function} callback - callback that will be called with an array of folder paths to
 * modules that contain 'manifest.json' files
 */
function getDefaultModules(callback) {
  var defaultModules = [];
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
    this.state ={
      showModal: false,
      moduleMetadatas: []
    }
  }

  componentWillMount() {
    var _this = this;
    getDefaultModules((moduleFolderPathList) => {
      _this.fillDefaultModules(moduleFolderPathList, (metadatas) => {
        _this.sortMetadatas(metadatas);
        _this.setState({moduleMetadatas: metadatas});
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
      showDevOptions: false,
      localAppFilePath: ""
    }
    this.updateCheckModal = this.updateCheckModal.bind(this);
    this.handleFilePathChange = this.handleFilePathChange.bind(this);
    this.developerApp = this.developerApp.bind(this);
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

  handleFilePathChange(event){
    this.setState({
      localAppFilePath: event.target.value
    });
  }

  developerApp(filepath){
    var folderName = pathex.join(window.__base, filepath);
    fs.access(folderName, fs.F_OK, (err) => {
      if(!err){
        console.log("Were in");
        CheckDataGrabber.loadModuleAndDependencies(folderName);
        localStorage.setItem('lastCheckModule', folderName);
      } else {
        console.error(err);
      }
    });
    this.close();
  }

  render() {
    var filepath;
    return (
      <div>
        <Modal show={this.state.showModal} onHide={this.close}>
          <Modal.Header closeButton style={{backgroundColor: "#333333", color: "#FFFFFF"}}>
            <Modal.Title>Change Tool Check category</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{backgroundColor: "#333333"}}>
            <SwitchCheck />
          </Modal.Body>
          <Modal.Footer style={{backgroundColor: "#333333"}}>
            {api.getSettings('developerMode') ? <div>
              <Button onClick={
                () => {
                  this.setState({showDevOptions: !this.state.showDevOptions});
                }
              }>
                Developer Options
              </Button>
              <Panel collapsible expanded={this.state.showDevOptions}>
                <h3>Load a tool locally</h3>
                <input type="text"
                  placeholder="Path your modules root in relation to window.__base"
                  value={this.state.localAppFilePath}
                  onChange={this.handleFilePathChange}
                  style={{width: "100%"}} />
                <Button onClick={
                  () => {
                    this.developerApp(this.state.localAppFilePath);
                  }
                }>
                  Load Tool
                </Button>
              </Panel>
            </div>: <div></div>}
            <Button bsStyle="danger" onClick={this.close}>Close</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

exports.Component = SwitchCheck;
exports.Modal = SwitchCheckModal;
exports.getDefaultModules = getDefaultModules;
