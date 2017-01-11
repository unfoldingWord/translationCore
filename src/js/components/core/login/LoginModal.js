const React = require('react');

const Button = require('react-bootstrap/lib/Button.js');
const Modal = require('react-bootstrap/lib/Modal.js');
const CoreStore = require('../../../stores/CoreStore.js');
const style = require('./loginStyle');
const Login = require('./Login.js');
const Profile= require('./Profile');

class LoginModal extends React.Component {
    render(){
      let display;
      if(this.props.loginModalVisibility){
        display = <Login {...this.props.loginProps}/>
      }else{
        display = <Profile {...this.props.profileProps} {...this.props.profileProjectsProps}/>
      }
      return(
        <div style={style.modal}>
          <Modal show={this.props.showModal} onHide={this.props.close}>
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
