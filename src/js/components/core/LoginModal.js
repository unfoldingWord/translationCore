const React = require('react');

const Button = require('react-bootstrap/lib/Button.js');
const Modal = require('react-bootstrap/lib/Modal.js');
const CoreActions = require('../../actions/CoreActions.js');
const CoreStore = require('../../stores/CoreStore.js');
const style = require('../../styles/loginStyle');
const Login = require('./Login.js');

class LoginModal extends React.Component {
    constructor(){
      super();
      this.state = {visibleLogin: false};
    }

    componentWillMount() {
      CoreStore.addChangeListener(this.updateLoginModal.bind(this));
    }

    componentWillUnmount() {
      CoreStore.removeChangeListener(this.updateLoginModal.bind(this));
    }

    updateLoginModal(){
      this.setState({visibleLogin: CoreStore.getLoginModal()});
    }

    close(){
      CoreActions.updateLoginModal(false);
    }

    open(){
      this.setState({visibleLogin: true});
    }

    render(){
      return(
        <div style={style.modal}>
          <Modal show={this.state.visibleLogin} onHide={this.close.bind(this)}>
            <Modal.Header closeButton>
              <Modal.Title>Login Page</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Login />
            </Modal.Body>
            <Modal.Footer>
              <Button type="button" onClick={this.close.bind(this)}>Close</Button>
            </Modal.Footer>
          </Modal>
      </div>
    );
  }
}

module.exports = LoginModal;
