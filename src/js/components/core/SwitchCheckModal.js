
const React = require('react');
const Button = require('react-bootstrap/lib/Button.js');
const Modal = require('react-bootstrap/lib/Modal.js');
const CoreStore = require('../../stores/CoreStore.js');
const CoreActions = require('../../actions/CoreActions.js');
const SwitchCheckModuleDropdown = require('./SwitchCheckModuleDropdown');

class SwitchCheckModal extends React.Component{
  constructor(){
    super();
    this.state ={
      showModal: false,
    }
  }

  componentWillMount() {
    CoreStore.addChangeListener(this.updateCheckModal.bind(this));
  }

  componentWillUnmount() {
    CoreStore.removeChangeListener(this.updateCheckModal.bind(this));
  }

  updateCheckModal() {
    this.setState({showModal: CoreStore.getCheckModal()});
  }

  close() {
    CoreActions.updateCheckModal(false);
  }

  render() {
    return (
      <div>
        <Modal show={this.state.showModal} onHide={this.close}>
          <Modal.Header closeButton>
            <Modal.Title>Change Check category</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <SwitchCheckModuleDropdown />
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.close}>Close</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

module.exports = SwitchCheckModal;
