const React = require('react');

const Button = require('react-bootstrap/lib/Button.js');
const Modal = require('react-bootstrap/lib/Modal.js');
const CoreStore = require('../../stores/CoreStore.js');
const CoreActions = require('../../actions/CoreActions.js');
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

    open(){
      this.setState({visibleLogin: true});
    }
    close(){
      CoreActions.updateLoginModal(false);
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
              <Button type={"button"}>Close</Button>
            </Modal.Footer>
          </Modal>
      </div>
    );
  }
}

module.exports = LoginModal;
