/**
 * @description: Modal to have direct access to translation projects
 * @param (string) filepath from file dialog
 **/

var React = require('react');
var ReactDOM = require('react-dom');
var Button = require('react-bootstrap/lib/Button.js');
var Modal = require('react-bootstrap/lib/Modal.js');
var CoreActions = require('../../actions/CoreActions.js');
var CoreStore = require('../../stores/CoreStore.js');
var style = require('../../styles/AccessStyle.js');
var Access = require('./AccessProject.js');
var path = require('path');
var remote = window.electron.remote;
var {dialog} = remote;
const api = window.ModuleApi;


var AccessProjectMod = React.createClass({
  getInitialState: function() {
    return ({
    visibleAccess: false,
  });
  },

  componentWillMount: function() {
      CoreStore.addChangeListener(this.updateShow);

  },

  componentWillUnmount: function() {
      CoreStore.addChangeListener(this.updateShow);
  },

  updateShow: function() {
    this.setState({visibleAccess: CoreStore.getOpenModal()}); //TODO:
  },

  open: function() {
    this.setState({visibleAccess: true});
  },



  readDir: function() {
    dialog.showOpenDialog({
      properties: ['openDirectory']
    }, function(filename) {
      if (filename !== undefined) {
      try {
        var file = filename[0];
        api.putDataInCommon('saveLocation', file)
        Access.openDir(path.join(file));
        CoreActions.showOpenModal(false);
      } catch (e) {
        dialog.showErrorBox('Read directory error', e);
      }

    }
  });
},

  handleKeyPress: function(e) {
        var enterKey = 13;
        if (e.charCode == enterKey) {
          dialog.showOpenDialog({
            properties: ['openDirectory']
          }, function(filename) {
            if (filename !== undefined) {
            try {
              var file = filename[0];
              Access.openDir(path.join(file));
            } catch (e) {
              dialog.showErrorBox('Read directory error', e);
            }
          }
          });
        }
      },

  close: function() {
    CoreActions.showOpenModal(false);
    this.setState({visibleAccess: CoreStore.getOpenModal()});
  },

  render: function(){
       return(
         <div style={style.modal}>
           <Modal show={this.state.visibleAccess} onHide={this.close}>
             <Modal.Header closeButton>
               <Modal.Title>Open Translation Core Projects</Modal.Title>
             </Modal.Header>
             <Modal.Body>
             </Modal.Body>
             <Modal.Footer>
               <Button type="button" onKeyPress={this.handleKeyPress} onClick={this.readDir}>Open Translation Project</Button>
             </Modal.Footer>
           </Modal>
       </div>
     );
   }

});

module.exports = AccessProjectMod;
