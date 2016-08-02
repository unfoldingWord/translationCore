
const React = require('react');
const path = require('path');
const Button = require('react-bootstrap/lib/Button.js');
const Modal = require('react-bootstrap/lib/Modal.js');
const CoreStore = require('../../stores/CoreStore.js');
const CoreActions = require('../../actions/CoreActions.js');
const FileModule = require('./FileModule.js');
const CheckDataGrabber = require('./create_project/CheckDataGrabber.js');
const AppDescription = require('./AppDescription');

class SwitchCheckModal extends React.Component{
  constructor(){
    super();
    this.state ={
      showModal: false,
      moduleMetadatas: []
    }
    this.updateCheckModal = this.updateCheckModal.bind(this);
  }

  componentWillMount() {
    CoreStore.addChangeListener(this.updateCheckModal);
    this.getDefaultModules((moduleFolderPathList) => {
      this.fillDefaultModules(moduleFolderPathList, (metadatas) => {
        this.setState({moduleMetadatas: metadatas});
      });
    });
  }

  componentWillUnmount() {
    CoreStore.removeChangeListener(this.updateCheckModal);
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
    fs.readDir(path.join(window.__base, 'modules'), function(error, folders) {
      if (error) {
        console.error(error);
      }
      else {
        for (var folder of folders) {
          if (fs.accessSync(path.join(folder, 'manifest.json')) {
            defaultModules.push(folder);
          }
        }
      }
      callback(defaultModules);
    });
  }

  fillDefaultModules(moduleFolderPathList, callback) {
    var tempMetadatas = [];
    for(var folderPath of moduleFolderPathList) {
      fs.readJson(path.join(folderPath, "manifest.json"), (metadata) => {
        metadata.folderName = path.basename(folderPath);
        tempMetadatas.push(metadata);
      });
    }
    callback(tempMetadatas);
  }

  moduleClick(folderName) {
    this.close();
    CheckDataGrabber.loadModuleAndDependencies(folderName);
  }

  updateCheckModal() {
    this.setState({showModal: CoreStore.getCheckModal()});
  }

  close() {
    CoreActions.updateCheckModal(false);
  }

  render() {
    var buttons;
    if(!this.state.moduleMetadatas || this.state.moduleMetadatas.length == 0) {
      console.error('No tC default modules found.');
      buttons = <div>No tC default modules found.</div>;
    }
    else {
      buttons = this.state.moduleMetadatas.map((metadata) => {
        return (
          <AppDescription key={metadata.folderName}
                          imagePath={metadata.imagePath}
                          title={metadata.title}
                          description={metadata.description}
                          useApp={this.moduleClick.bind(this)}
                          folderName={metadata.folderName}
          />
        );
      });
    }
    return (
      <div>
        <Modal show={this.state.showModal} onHide={this.close}>
          <Modal.Header closeButton>
            <Modal.Title>Change Check category</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {buttons}
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.close}>Close</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

module.exports = SwitchCheckModal;
