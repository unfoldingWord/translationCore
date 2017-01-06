//SwitchCheckModal.js//
/**
 * @description - This file describes the modal that lists out the available modules that a
 * checker may choose to check
 * @author: Logan Lebanoff
 */

 //node module imports
const React = require('react');

//bootstrap imports
const Button = require('react-bootstrap/lib/Button.js');
const Modal = require('react-bootstrap/lib/Modal.js');
const Panel = require('react-bootstrap/lib/Panel.js');

//locally defined imports
const CoreStore = require('../../stores/CoreStore.js');

class SwitchCheckModal extends React.Component {
  constructor(){
    super();
  }
  componentWillMount() {
    CoreStore.addChangeListener(this.props.updateCheckModal);
  }

  componentWillUnmount() {
    CoreStore.removeChangeListener(this.props.updateCheckModal);
  }
  render() {
    var filepath;
    return (
      <div>
        <Modal show={this.props.showModal} onHide={this.props.close}>
          <Modal.Header closeButton style={{backgroundColor: "#333333", color: "#FFFFFF"}}>
            <Modal.Title>Change Tool Check category</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{backgroundColor: "#333333"}}>
            {this.props.children}
          </Modal.Body>
          <Modal.Footer style={{backgroundColor: "#333333"}}>
            {this.props.developerMode ? <div>
              <Button onClick={this.props.updateDevOptions}>
                Developer Options
              </Button>
              <Panel collapsible expanded={this.props.showDevOptions}>
                <h3>Load a tool locally</h3>
                <input type="text"
                  placeholder="Path your modules root in relation to window.__base"
                  value={this.props.localAppFilePath}
                  onChange={this.props.handleFilePathChange}
                  style={{width: "100%"}} />
                <Button onClick={
                  () => {
                    this.props.developerApp(this.props.localAppFilePath);
                  }
                }>
                  Load Tool
                </Button>
              </Panel>
            </div>: <div></div>}
            <Button bsStyle="danger" onClick={this.props.close}>Close</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

module.exports = SwitchCheckModal;
