const React = require('react');
const Button = require('react-bootstrap/lib/Button.js');
const ButtonToolbar = require('react-bootstrap/lib/ButtonToolbar.js');
const Alert = require('react-bootstrap/lib/Alert.js');
const CoreStore = require('../../stores/CoreStore.js');
const CoreActions = require('../../actions/CoreActions.js');
const Modal = require('react-bootstrap/lib/Modal.js');

var alertMessage = {};
// var Alert = {
//   title: "Warning",
//   content: "You Did Something Wrong",
//   leftButtonText: "Ok",
//   rightButtonText: "Cancel",
//   visibility: true
// }
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
    try {
      alertMessage = data['alertObj'];
    }
    catch(e){

    }

    //{title:Warning, content:YOU MESSED UP, leftButtonText:OK...}
    if (data) {
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
    var response = this.state.lefttButtonText;
    this.setState({visibility: false}, CoreActions.sendAlertResponse(response));
    alertMessage = {};
  },

  handleAlertOK() {
    var response = this.state.rightButtonText;
    this.setState({visibility: false}, CoreActions.sendAlertResponse(response));
  alertMessage = {};
},

getStyleFromState(value) {
  //style={this.getStyleFromState(this.state.visibility)}
  if (value){
    return {
      zIndex:100,
      display: 'inline'
    }
  } else {
    return {
      zIndex:100,
      display: 'none'
    }
  }
},

render() {
  var alertStyle = {
    display:'tableCell',
    verticalAlign:'middle',
    width:'450px',
    height:'200px'
  }

  var alertDiv = {
    padding: '1em',
    position: 'absolute',
    top: '20%',
    left: '50%',
    marginRight: '-50%',
    transform:' translate(-50%, -50%)'
  }

  var alertContent = {
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
    <Button bsStyle="danger" style={{height:'30px', width:'60px', textAlign:'center', verticalAlign:'middle', padding:0}} onClick={this.handleAlertDismiss}>{this.state.leftButtonText}</Button>
    <Button style={{height:'30px', width:'60px', textAlign:'center', verticalAlign:'middle', padding:0}} onClick={this.handleAlertOK}>{this.state.rightButtonText}</Button>
    </ButtonToolbar>
    </Alert>
    </Modal.Footer>
    </Modal>
    </div>
  );
}

});

module.exports = AlertModal;
