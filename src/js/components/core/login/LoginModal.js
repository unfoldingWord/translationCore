const React = require('react');

const Button = require('react-bootstrap/lib/Button.js');
const Modal = require('react-bootstrap/lib/Modal.js');
const CoreStore = require('../../../stores/CoreStore.js');
const CoreActions = require('../../../actions/CoreActions.js');
const style = require('./loginStyle');
const Login = require('./Login.js');
const Profile= require('./Profile');

class LoginModal extends React.Component {
    constructor(){
      super();
      this.state = {visibleLoginModal: false, profile: false};
    }

    componentWillMount() {
      CoreStore.addChangeListener(this.updateLoginModal.bind(this));
      CoreStore.addChangeListener(this.updateProfileVisibility.bind(this));
    }

    componentWillUnmount() {
      CoreStore.removeChangeListener(this.updateLoginModal.bind(this));
      CoreStore.removeChangeListener(this.updateProfileVisibility.bind(this));

    }

    updateLoginModal(){
      this.setState({visibleLoginModal: CoreStore.getLoginModal()});
    }

    updateProfileVisibility(){
      this.setState({profile: CoreStore.getProfileVisibility()});
    }

    close(){
      CoreActions.updateLoginModal(false);
    }

    render(){
      let display;
      if(this.state.profile === false){
        display = <Login />
      }else{
        display = <Profile />
      }

      return(
        <div style={style.modal}>
          <Modal show={this.state.visibleLoginModal} onHide={this.close.bind(this)}>
            <Modal.Header closeButton>
              <Modal.Title>Login Page</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {display}
            </Modal.Body>
            <Modal.Footer>
              <Button type={"button"} onClick={this.close.bind(this)}>Close</Button>
            </Modal.Footer>
          </Modal>
      </div>
      );
  }
}

module.exports = LoginModal;
