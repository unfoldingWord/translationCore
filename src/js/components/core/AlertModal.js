
/**
* @description - Displays alert and returns user response
*/
const React = require('react');
const Panel = require('react-bootstrap/lib/Panel.js');
const Alert = require('react-bootstrap/lib/Alert.js');
const CoreStore = require('../../stores/CoreStore.js');
const Modal = require('react-bootstrap/lib/Modal.js');

class AlertModal extends React.Component {
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
                    
                    {this.props.leftButtonText ?
                       <button className="btn-second" style={this.props.currentStyle} onClick={()=>this.props.alertDismiss(this.props.leftButtonText, this.props.callback)}>
                      {this.props.leftButtonText}
                    </button> : null}

                    {this.props.rightButtonText ?
                       <button style={this.props.currentStyle} onClick={()=>this.props.alertDismiss(this.props.rightButtonText, this.props.callback)}>
                      {this.props.rightButtonText}
                    </button> : null}

                    <button onClick={this.props.toggleMoreInfo}>
                      More Info
                    </button>
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
