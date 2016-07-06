const React = require('react');
const Button = require('react-bootstrap/lib/Button.js');
const Modal = require('react-bootstrap/lib/Modal.js');
const FormGroup = require('react-bootstrap/lib/FormGroup.js');
const ControlLabel = require('react-bootstrap/lib/ControlLabel.js');
const FormControl = require('react-bootstrap/lib/FormControl.js');
const style = require('../styles/loginStyle');

const CoreActions = require('../actions/CoreActions.js');
const CoreStore = require('../stores/CoreStore.js');

class LoginModal extends React.Component {
    constructor(){
      super();
      this.state = {visibleLogin: false};
    }

    componentWillMount() {
      CoreStore.addChangeListener(this.updateLoginModal.bind(this));
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

    handleSubmit(event){
      event.preventDefault();//prevents page from reloading
      let userName = this._userName;
      let password = this._password;
    }

    render(){
      return(
        <div>
          <Modal show={this.state.visibleLogin} onHide={this.close.bind(this)}>
            <Modal.Header closeButton>
              <Modal.Title>Login Page</Modal.Title>
            </Modal.Header>

            <Modal.Body>
              <form>
                <FormGroup controlId="login-form">
                <ControlLabel>Door43 Account</ControlLabel>
                  <FormControl type="text" value={this.state.value}
                  placeholder="Door43 Account" style={style.loginbox.input} />
                  <FormControl type="password" value={this.state.value}
                  placeholder="Password" style={style.loginbox.input} />
                </FormGroup>
              </form>
            </Modal.Body>

            <Modal.Footer>

              <Button bsStyle="primary" type="submit"
              onClick={this.handleSubmit.bind(this)}
              style={style.footer.button}>Login</Button>

              <a href="https://git.door43.org/user/sign_up">
                <Button type="submit">Create Account</Button>
              </a>
            </Modal.Footer>

          </Modal>
      </div>
    );
  }
}

module.exports = LoginModal;
