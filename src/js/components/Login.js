const React = require('react');

const FormGroup = require('react-bootstrap/lib/FormGroup.js');
const ControlLabel = require('react-bootstrap/lib/ControlLabel.js');
const FormControl = require('react-bootstrap/lib/FormControl.js');
const style = require('../styles/loginStyle');
const Button = require('react-bootstrap/lib/Button.js');
const Grid = require('react-bootstrap/lib/Grid.js');
const Row = require('react-bootstrap/lib/Row.js');
const Col = require('react-bootstrap/lib/Col.js');

const gogs = require('./GogsApi.js');


class Login extends React.Component{
  constructor(){
    super();
    this.state = {userName: "", pasword: ""};
  }
  handleSubmit(event){
    event.preventDefault();//prevents page from reloading
    var userdata = {
        username: this.state.userName,
        password: this.state.password
     }
      var newuser = gogs().login(userdata).then(function (userdata) {
        console.log(userdata);
    });
  }
  handleUserName(e){
    this.setState({userName: e.target.value});
  }
  handlePassword(e){
    this.setState({password: e.target.value});
  }

  render(){
    return(
      <Grid>
        <Row className="show-grid">
          <Col md={4} sm={5} xs={12} style={style.loginGridLeft}>
            <form>
              <FormGroup controlId="login-form">
                <ControlLabel>Door43 Account</ControlLabel>
                  <FormControl type="text" placeholder="Door43 Account"
                  style={style.loginbox.input} onChange={this.handleUserName.bind(this)}/>
                  <FormControl type="password" placeholder="Password"
                  style={style.loginbox.input} onChange={this.handlePassword.bind(this)}/>
              </FormGroup>
              <Button bsStyle="primary" type="submit"
              onClick={this.handleSubmit.bind(this)}
              style={style.footer.button}>Sign In</Button>
            </form>
          </Col>
          <Col md={4} sm={4} xs={12} style={style.loginGridRight}>
            <Button type="submit">Register</Button>
          </Col>
         </Row>
      </Grid>
    );
  }
}

module.exports = Login;
