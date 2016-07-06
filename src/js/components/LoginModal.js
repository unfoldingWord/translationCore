const React = require('react');
const Button = require('react-bootstrap/lib/Button.js');
const Modal = require('react-bootstrap/lib/Modal.js');

const CoreActions = require('../actions/CoreActions.js');
const CoreStore = require('../stores/CoreStore.js');

class LoginModal extends React.Component {
  constructor(){
    super();
    this.state = {visibleLogin: true};
  },

  updateLoginModal(){
    this.setState({visibleLogin: CoreStore.getLoginModal()});
  },

  _close(){
    this.setState({visibleLogin: false});
  },

  _open(){
    this.setState({visibleLogin: true});
  },

  _handleSubmit(event){
    event.preventDefault();//prevents page from reloading
    let userName = this._userName;
    let password = this._password;
  },

  render(){
    return(
      <div>
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Title>Login Page</Modal.Title>
            </Modal.Header>

            <Modal.Body>
              <form>
                <FormGroup controlId="login-form">
                  <ControlLabel>Door43 Account</ControlLabel>
                  <FormControl type="text" value={this.state.value} placeholder="Door43 Account" />
                  <FormControl type="password" value={this.state.value} placeholder="Password" />
                </FormGroup>
              </form>
            </Modal.Body>

            <Modal.Footer className="login-form-actions">
              <Button bsStyle="primary" type="submit" onClick={this._handleSubmit.bind(this)}>Login</Button>
              <a href="https://git.door43.org/user/sign_up">
                <Button type="submit">Create Account</Button>
              </a>
            </Modal.Footer>

          </Modal.Dialog>
      </div>
    );
  }
}

module.exports = LoginModal;
