/**
 * @author Gregory Fuentes
 * @description: This is the modal for Opening Project Functionality both online and offline.
 ******************************************************************************/

var React = require('react');
var remote = window.electron.remote;
var {dialog} = remote;
var OpenOnline = require('./GitClone.js');
var api = window.ModuleApi;
var Access = require('./AccessProject.js');
var FormGroup = require('react-bootstrap/lib/FormGroup.js');
var FormControl = require('react-bootstrap/lib/FormControl.js');
var path = require('path');
var pathex = require('path-extra');

var Button = require('react-bootstrap/lib/Button.js');
var Nav = require('react-bootstrap/lib/Nav.js');
var NavItem = require('react-bootstrap/lib/NavItem.js');
var Modal = require('react-bootstrap/lib/Modal.js');
var LoadOnline = require('./LoadOnline.js');

var CoreStore = require('../../stores/CoreStore.js');
var CoreActions = require('../../actions/CoreActions.js');
var DragDrop = require('./DragDrop.js');

var OpenForReal = React.createClass({
  componentWillMount: function() {
    CoreStore.addChangeListener(this.updateModal)
  },

  getInitialState: function() {
    return {
      showModal: false,
      value: "",
      active: 1
    };
  },

  handleSelect: function(eventKey) {
    this.setState({active: eventKey});
  },

  handleChange: function(e) {
      this.setState({value: e.target.value});
    },

  componentWillUnMount: function() {
    CoreStore.removeChangeListener(this.updateModal);
  },

  updateModal: function() {
    this.setState({showModal: CoreStore.getOpenView()})
  },

  close: function(){
    CoreActions.updateOpenView(false);
  },

  submitViaEnter: function(e) {
    var EnterKey = 13;
    if (e.keyCode === EnterKey) {
      this.handleOnline();
    } else {
      return;
    }
  },

  handleOnline: function() {
    var url = this.state.value;
    var projectName = url.split('/').pop();
    var local = path.join(pathex.homedir(), 'Translation Core', projectName);
    var _this = this;

      LoadOnline(url, function(local, url) {
        _this.OpenLocal(local);
        api.putDataInCommon('saveLocation', local);
      });

    this.state.value = "";
  },

  OpenLocal: function(data) {
    try {
      api.putDataInCommon('saveLocation', data);
      Access.loadFromFilePath(data);
      CoreActions.updateOpenView(false);

    } catch (e) {
      dialog.showErrorBox('Read directory error', e);
    }
  },

render: function() {
  var mainContent;
   if (this.state.active === 1) {
     mainContent = (
       <FormGroup>
            <FormControl type="text" value={this.state.value} placeholder="Enter URL" onChange={this.handleChange} onKeyDown={this.submitViaEnter} />
             <Button bsStyle="primary" onClick={this.handleOnline} pullRight>
               Submit
             </Button>
            <FormControl.Feedback />
           </FormGroup>
                   );
   } else {
     mainContent = ( <div>
                      <DragDrop sendFilePath={this.OpenLocal}/>
                     </div>);
   }
  return (
            <div>
              <Modal show={this.state.showModal} onHide={this.close} data-toggle="collapse">
                  <Modal.Header closeButton>
                    <Modal.Title>Open Translation Project</Modal.Title>
                  </Modal.Header>
               <Modal.Body>
                <Nav bsStyle="tabs" activeKey={this.state.active} onSelect={this.handleSelect}>
                 <NavItem eventKey={1}>{'Open Project from Online'}</NavItem>
                 <NavItem eventKey={2}>{'Open Project Locally'}</NavItem>
                </Nav>
                {mainContent}
               </Modal.Body>
              </Modal>
             </div>
  );
}
});

module.exports = OpenForReal;
