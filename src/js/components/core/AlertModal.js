
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
              <Alert bsStyle="danger" onDismiss={()=>this.props.alertDismiss(null, this.props.callback)} style={alertStyle}>
                <center>
                  <div style={alertDiv}>
                    <h3>{this.props.title}</h3>
                    <p>{this.props.content}</p>
                    {this.props.leftButtonText ? <Button bsStyle="danger" style={this.props.currentStyle} onClick={()=>this.props.alertDismiss(this.props.lefttButtonText, this.props.callback)}>
                      {this.props.leftButtonText}
                    </Button> : null}

                    {this.props.rightButtonText ? <Button style={this.props.currentStyle} onClick={()=>this.props.alertDismiss(this.props.rightButtonText, this.props.callback)}>
                      {this.props.rightButtonText}
                    </Button> : null}

                    <Button onClick={this.props.toggleMoreInfo}>
                      More Info
                    </Button>
                    <Panel collapsible expanded={this.props.moreInfoOpen}>
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
