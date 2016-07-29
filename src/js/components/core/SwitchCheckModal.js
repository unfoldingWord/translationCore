
const React = require('react');
const path = require('path');
const Button = require('react-bootstrap/lib/Button.js');
const Modal = require('react-bootstrap/lib/Modal.js');
const CheckStore = require('../../stores/CheckStore.js');
const CoreStore = require('../../stores/CoreStore.js');
const CoreActions = require('../../actions/CoreActions.js');
const FileModule = require('./FileModule.js');
const CheckDataGrabber = require('./create_project/CheckDataGrabber.js');

var _this;

class SwitchCheckModal extends React.Component{
  constructor(){
    super();
    _this = this
    this.state ={
      showModal: false,
    }
    this.updateCheckModal = this.updateCheckModal.bind(this);
    FileModule.readJsonFile(window.__base + "modules/module_list.json", (jsonObject) => {
      this.defaultModules = jsonObject;
    });
  }

  componentWillMount() {
    CoreStore.addChangeListener(this.updateCheckModal);
  }

  componentWillUnmount() {
    CoreStore.removeChangeListener(this.updateCheckModal);
  }

  fillDefaultModules(jsonObject) {
    this.defaultModules = jsonObject;
  }

  moduleClick(folderName) {
    FileModule.readJsonFile(path.join(window.__base, "modules", folderName, "manifest.json"), (jsonObject) => {
      // hard coded
      var params = {originalLanguagePath: "C:/Users/Logan Lebanoff/Desktop/8woc/8woc/data/ulgb", targetLanguagePath: "C:/Users/Logan Lebanoff/Desktop/8woc/test_files/Ephesians", repo: undefined, bookAbbr: "eph"}
      var array = [];
      array.push([jsonObject.name, path.join(window.__base, "modules", folderName)]);
      for(let childFolderName of jsonObject.include) {
        array.push([childFolderName, path.join(window.__base, "modules", childFolderName)]);
      }
      // hard coded
      if(!CheckStore.storeData.common) {
        CheckStore.storeData.common = {};
        CheckStore.storeData.common.saveLocation = "C:/Users/Logan Lebanoff/Desktop/8woc/test_files/Ephesians";
      }
      debugger;
      CheckDataGrabber.getFetchData(array, params);
    });
  }

  updateCheckModal() {
    this.setState({showModal: CoreStore.getCheckModal()});
  }

  close() {
    CoreActions.updateCheckModal(false);
  }

  render() {
    if(!this.defaultModules)
      console.error('No tC default modules found.');

    var buttons = this.defaultModules.map((moduleFolderName) => {
      return (
        <Button key={moduleFolderName} onClick={this.moduleClick.bind(this, moduleFolderName)}>{moduleFolderName}</Button>
      );
    });
    
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
