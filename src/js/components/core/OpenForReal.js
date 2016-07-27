var React = require('react');
var remote = window.electron.remote;
var {dialog} = remote;
var OpenOnline = require('./GitClone.js');
//var OpenLocal = require('./AccessProjectModal.js')
var api = window.ModuleApi;
var directory = require('path');
var Access = require('./AccessProject.js');
var FormGroup = require('react-bootstrap/lib/FormGroup.js');
var FormControl = require('react-bootstrap/lib/FormControl.js');

var Button = require('react-bootstrap/lib/Button.js');
var Nav = require('react-bootstrap/lib/Nav.js');
var NavItem = require('react-bootstrap/lib/NavItem.js');
var Modal = require('react-bootstrap/lib/Modal.js');


var CoreStore = require('../../stores/CoreStore.js');
var CoreActions = require('../../actions/CoreActions.js');
var DragDrop = require('./DragDrop.js');
//Ask about API and Gulp
//TODO: borders?
//TODO: Center? margin: auto
//TODO: Text align
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
    var remote = url;
    var projectName = url.split('/').pop(); //pops last element of
    var local = path.join(pathex.homedir(), 'Translation Core', projectName);


    OpenOnline(local).mirror(url, local, function(err) {
      if (err)
      dialog.showErrorBox("Cloning Repo Error:", err.message);
      OpenOnline(local).pull(remote, 'master', function(err) {
        if (err)
        dialog.showErrorBox("Pulling Repo Error:", err.message);
      });
    });
    console.log('Git Online save to local save:');
    console.log("Localpath: " + local);
    console.log("Git online save to local parent:");
    console.log(local.join('../'));
    api.putDataInCommon('saveLocation', data);
    Access.loadFromFilePath(local.join('../'));

    this.state.value = "";
    console.log("State value: " + this.stata.value);
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
     mainContent = (<div>
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
