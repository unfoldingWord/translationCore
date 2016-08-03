
/**
* @description - Displays alert and returns user response
*/
const React = require('react');
const Button = require('react-bootstrap/lib/Button.js');
const ButtonToolbar = require('react-bootstrap/lib/ButtonToolbar.js');
const Alert = require('react-bootstrap/lib/Alert.js');
const CoreStore = require('../../stores/CoreStore.js');
const CoreActions = require('../../actions/CoreActions.js');
const Modal = require('react-bootstrap/lib/Modal.js');
var alertMessage = {};
var alertStyle;
var alertDiv;
var alertContent;

const AlertModal = React.createClass({
  getInitialState() {
    return {
      title: "",
      content: "",
      leftButtonText: "",
      rightButtonText: "",
      visibility:false
    };
  },

  componentWillMount() {
    CoreStore.addChangeListener(this.alertMessage);
  },

  alertMessage() {
    var data = CoreStore.getAlertMessage();
    if (data) {
    try {
      alertMessage = data['alertObj'];
    }
    catch(e){
    }


      try {
        this.setState({
          title: alertMessage['title'],
          content: alertMessage['content'],
          leftButtonText: alertMessage['leftButtonText'],
          rightButtonText: alertMessage['rightButtonText'],
          visibility: true
        });
      } catch (e) {
      }
    }
  },

  handleAlertDismiss() {
    var response = this.state.leftButtonText;
    this.setState({visibility: false}, CoreActions.sendAlertResponse(response));
    alertMessage = {};
  },

  handleAlertOK() {
    var response = this.state.rightButtonText;
    this.setState({visibility: false}, CoreActions.sendAlertResponse(response));
    alertMessage = {};
  },

  getStyleFromState(value) {
    if (value){
      return {
        height:'30px',
        width:'60px',
        textAlign:'center',
        verticalAlign:'middle',
        padding:0
      }
    } else {
      return {
        display: 'none'
      }
    }
  },

  render() {
    alertStyle = {
      display:'tableCell',
      verticalAlign:'middle',
      width:'450px',
      height:'200px'
    }

    alertDiv = {
      padding: '1em',
      position: 'absolute',
      top: '20%',
      left: '50%',
      marginRight: '-50%',
      transform:' translate(-50%, -50%)'
    }

    alertContent = {
      padding: '1em',
      position: 'absolute',
      top: '100%',
      left: '50%',
      marginRight: '-50%',
      transform:' translate(-50%, -50%)'
    }
    return (
      <div >
      <Modal show={this.state.visibility}>
      <Modal.Footer style={{position:'fixed', top:-100, marginTop:200, right:60}}>
      <Alert bsStyle="danger" onDismiss={this.handleAlertDismiss} style={alertStyle}>
      <div style={alertDiv}>
      <h3>{this.state.title}</h3>
      <p style={alertContent}>{this.state.content}</p>
      </div>
      <ButtonToolbar style={{position:'absolute', top:'70%', left: '50%',marginRight: '-50%', transform: 'translate(-50%, -50%)'}}>
      <Button bsStyle="danger" style={this.getStyleFromState(this.state.leftButtonText)} onClick={this.handleAlertDismiss}>{this.state.leftButtonText}</Button>
      <Button style={this.getStyleFromState(this.state.rightButtonText)} onClick={this.handleAlertOK}>{this.state.rightButtonText}</Button>
      </ButtonToolbar>
      </Alert>
      </Modal.Footer>
      </Modal>
      </div>
    );
  }

});

module.exports = AlertModal;
