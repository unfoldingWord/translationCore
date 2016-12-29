const React = require('react');
const CoreActions = require('../../../actions/CoreActions.js');
const Modal = require('react-bootstrap/lib/Modal.js');
const Button = require('react-bootstrap/lib/Button.js');
const ButtonToolbar = require('react-bootstrap/lib/ButtonToolbar.js');
const CoreStore = require('../../../stores/CoreStore.js');
const api = window.ModuleApi;
const loadOnline = require('../LoadOnline');
const Upload = require('../Upload.js');
const UploadMethods = require('../UploadMethods.js');
const OnlineInput = require('../OnlineInput');
const DragDrop = require('../DragDrop');
const ImportUsfm = require('../Usfm/ImportUSFM');

class ProjectModal extends React.Component {
  constructor() {
    super();
    this.state = {
      showModal: false,
      show: 'link',
      active: '1',
      usfmPath: 'No file selected'
    }
  }

  componentWillMount() {
    CoreStore.addChangeListener(this.showCreateProject.bind(this));      // action to show create project modal
  }

  componentWillUnmount() {
    CoreStore.removeChangeListener(this.showCreateProject.bind(this));
  }

  /**
 * @description - This is called to change the status of the project modal
 * @param {string} input - string to set modal state, this string is specific
 * to the form to be display
 */
  showCreateProject(input) {
    var modal = CoreStore.getShowProjectModal();
    if (input) {
      modal = input;
      CoreStore.projectModalVisibility = input;
    }
    if (modal === 'Languages') {
      this.setState({
        showModal: true,
      });
    } else if (modal === "") {
      this.setState({
        showModal: false
      });
    }
  }

  submitLink() {
    var link = this.link;
    loadOnline(link, function(err, savePath, url) {
      if (!err) {
        Upload.Methods.sendFilePath(savePath, url);
      } else {
        console.error(err);
      }
    });
  }

  close() {
    CoreStore.projectModalVisibility = "";
    this.setState({
      showModal: false,
    });
  }

 checkUSFM(location) {
  this.setState({usfmPath: location});
  this.usfmSave = !(location == 'No file selected');
 }

 sendPath(path, link, callback) {
   this.setState({filePath: path});
   UploadMethods.sendFilePath(path, link, callback);
 }

 changeActive(key) {
   this.setState({ active: key });
   switch (key) {
     case 1:
       this.setState({ show: 'link' });
       break;
     case 2:
       this.setState({ show: 'file' });
       break;
     case 3:
       this.setState({ show: 'usfm' });
       break;
     case 4:
       this.setState({ show: 'd43' });
       break;
     default:
       break;
   }
 }

 handleOnlineChange(e) {
   this.link = e.target.value;
 }

 getMainContent(key) {
   var mainContent;
   switch (key) {
     case 'file':
       mainContent = <DragDrop
         filePath={this.state.filePath}
         sendFilePath={this.sendPath.bind(this)}
         properties={['openDirectory']}
         />;
       break;
     case 'link':
       mainContent = (
         <div>
           <br />
           <OnlineInput onChange={this.handleOnlineChange.bind(this)}/>
         </div>
       );
       break;
     case 'usfm':
       mainContent = (
         <div>
           <ImportUsfm.component open={ImportUsfm.open} filePath={this.state.usfmPath} checkIfValid={this.checkUSFM.bind(this)}/>
         </div>
       );
       break;
     case 'd43':
     var ProjectViewer = require('../../../containers/Projects.js');
       mainContent = (
         <div>
           <ProjectViewer />
         </div>
       )
       break;
     default:
       mainContent = (<div> </div>)
       break;
   }
   return mainContent;
 }

  onClick(e) {
    if (this.state.active == 1) {
      this.submitLink();
    }
    if (this.state.active == 3) {
      if (!this.usfmSave) {
        return;
      }
    }
    api.emitEvent('changeCheckType', { currentCheckNamespace: null });
    api.emitEvent('newToolSelected', {'newToolSelected': true});
    this.close();
    api.Toast.info('Info:', 'Your project is ready to be loaded once you select a tool', 5);
    if (this.state.active == 1){
      let loadedLink = this.link;
      if(loadedLink != ""){
        CoreActions.updateCheckModal(true);
      }
    }
  }

  _handleKeyPress(e) {
    if (e.key === 'Enter') {
      this.onClick(e);
    }
  }

  render() {
    return (
      <div>
        <Modal show={this.state.showModal} onHide={this.close.bind(this)} onKeyPress={this._handleKeyPress.bind(this)}>
          <Upload changeActive={this.changeActive.bind(this)} show={this.state.show} active={this.state.active}>
            {this.getMainContent(this.state.show)}
          </Upload>
          <Modal.Footer>
            <ButtonToolbar>
              <Button type="button" onClick={this.onClick.bind(this)} style={{ position: 'fixed', right: 15, bottom: 10 }}>{'Load'}</Button>
            </ButtonToolbar>
          </Modal.Footer>
        </Modal>
      </div>
    )
  }
}

module.exports = ProjectModal;
