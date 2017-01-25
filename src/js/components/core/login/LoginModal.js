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
      if(this.props.profileModalVisibility){
        display = <Profile {...this.props.profileProps} {...this.props.profileProjectsProps}/>
      }else{
        display = <Login {...this.props.loginProps}/>
      }
      return(
        <div style={style.modal}>
          <Modal show={this.props.showModal} onHide={this.props.close}>
            <Modal.Header closeButton style={style.modal}>
              <Modal.Title>Profile</Modal.Title>
            </Modal.Header>
            <Modal.Body style={style.modal}>
              {display}
            </Modal.Body>
            <Modal.Footer style={style.modal}>
              <Button type={"button"} onClick={this.props.close}>Close</Button>
            </Modal.Footer>
          </Modal>
      </div>
      );
  }
}

module.exports = LoginModal;
