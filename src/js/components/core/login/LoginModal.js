const React = require('react');

const Button = require('react-bootstrap/lib/Button.js');
const Modal = require('react-bootstrap/lib/Modal.js');
const CoreStore = require('../../../stores/CoreStore.js');
const style = require('./loginStyle');
const Login = require('./Login.js');
const Profile= require('./Profile');

class LoginModal extends React.Component {
    constructor(){
      super();
    }

    componentWillMount() {
      CoreStore.addChangeListener(this.props.updateLoginModal);
      CoreStore.addChangeListener(this.props.updateProfileVisibility);
    }

    componentWillUnmount() {
      CoreStore.removeChangeListener(this.props.updateLoginModal);
      CoreStore.removeChangeListener(this.props.updateProfileVisibility);

    }

    render(){
      let display;
      if(this.props.profile === false){
        display = <Login {...this.props.loginProps}/>
      }else{
        display = <Profile {...this.props.profileProps}/>
      }
      return(
        <div style={style.modal}>
          <Modal show={this.props.visibleLoginModal} onHide={this.props.close}>
            <Modal.Header closeButton>
              <Modal.Title>Profile</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {display}
            </Modal.Body>
            <Modal.Footer>
              <Button type={"button"} onClick={this.props.close}>Close</Button>
            </Modal.Footer>
          </Modal>
      </div>
      );
  }
}

module.exports = LoginModal;
