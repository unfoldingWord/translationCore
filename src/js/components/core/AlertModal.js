
/**
* @description - Displays alert and returns user response
*/
const React = require('react');
const Button = require('react-bootstrap/lib/Button.js');
const ButtonToolbar = require('react-bootstrap/lib/ButtonToolbar.js');
const Panel = require('react-bootstrap/lib/Panel.js');
const Alert = require('react-bootstrap/lib/Alert.js');
const CoreStore = require('../../stores/CoreStore.js');
const Modal = require('react-bootstrap/lib/Modal.js');

class AlertModal extends React.Component {
    //CoreStore.removeChangeListener(this.props.alertMessage);

  render() {
    var alertStyle = {
      display:'tableCell',
      verticalAlign:'middle',
      width:'450px',
      height:'250px'
    }

    var alertDiv = {
      position: 'relative',
      maxHeight: '60px'
    }

    return (
      <div>
        <Modal show={this.props.visibility}>
          <Modal.Footer style={{position:'fixed', top:-100, marginTop:200, right:60, borderTop:'none'}}>
              <Alert bsStyle="danger" onDismiss={this.props.showAlert(false)} style={alertStyle}>
                <center>
                  <div style={alertDiv}>
                    <h3>{this.props.title}</h3>
                    <p>{this.props.content}</p>
                    <Button bsStyle="danger" style={this.props.getStyleFromState(this.props.leftButtonText)} onClick={this.props.alertDismiss}>
                      {this.props.leftButtonText}
                    </Button>
                    <Button style={this.props.getStyleFromState(this.props.rightButtonText)} onClick={this.props.handleAlertOK}>
                      {this.props.rightButtonText}
                    </Button>
                    <Button onClick={this.props.handleOpen}>
                      More Info
                    </Button>
                    <Panel collapsible expanded={this.props.open}>
                      {this.props.moreInfo}
                    </Panel>
                  </div>
              </center>
            </Alert>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
};

module.exports = AlertModal;
