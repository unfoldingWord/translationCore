
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
    FileModule.readJsonFile(window.__base + "modules/module_list.json", (moduleFolderNameList) => {
      this.fillDefaultModules(moduleFolderNameList, (metadatas) => {
        this.setState({moduleMetadatas: metadatas});
      });
    });
  }

  componentWillUnmount() {
    CoreStore.removeChangeListener(this.updateCheckModal);
  }

  fillDefaultModules(moduleFolderNameList, callback) {
    var tempMetadatas = [];
    for(var folderName of moduleFolderNameList) {
      FileModule.readJsonFile(window.__base + "modules/" + folderName + "/manifest.json", (metadata) => {
        metadata.folderName = folderName;
        tempMetadatas.push(metadata);
      });
    }
    callback(tempMetadatas);
  }

  moduleClick(folderName) {
    this.close();
    CoreActions.startLoading();
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
