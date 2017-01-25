const React = require('react');
const FormGroup = require('react-bootstrap/lib/FormGroup.js');
const ControlLabel = require('react-bootstrap/lib/ControlLabel.js');
const FormControl = require('react-bootstrap/lib/FormControl.js');
const Button = require('react-bootstrap/lib/Button.js');
const Grid = require('react-bootstrap/lib/Grid.js');
const Row = require('react-bootstrap/lib/Row.js');
const Col = require('react-bootstrap/lib/Col.js');
const style = require('./loginStyle');
const Registration = require('./Registration.js');

class Login extends React.Component {
  constructor() {
    super();
  }

  render() {
    let { displayLogin } = this.props;
    if (!displayLogin) {
      return (
        <center>
        <Registration back={() => this.props.onSwitchToLoginPage(!displayLogin)}/>
        </center>
      );
    }else{
      return (
        <div>
          <Row className="show-grid">
            <Col md={12} sm={12} xs={12}>
            <center>
                <h4>Welcome Back!</h4>
                <FormGroup controlId="login-form">
                    <FormControl type="text" placeholder="Username"
                                 style={{width: '40%', margin: '15px'}}
                                 onChange={this.props.onHandleUserName}/>
                    <FormControl type="password"
                                 placeholder="Password"
                                 style={{width: '40%'}}
                                 onChange={this.props.onHandlePassword}/>
                </FormGroup>
                <Button bsStyle="primary"
                        type="submit"
                        onClick={() => {this.props.handleSubmit(this.props.userdata)}}
                        style={{width: '40%', fontWeight: 'bold', marginBottom: '50px'}}>
                        Sign In
                </Button>
                <h4>{"Don't have an account?"}</h4>
                <Button onClick={() => this.props.onSwitchToLoginPage(!displayLogin)}
                        bsStyle="primary"
                        type="submit"
                        style={{width: '40%', fontWeight: 'bold'}}>
                        Create an Account
                </Button><br/><br/>
                </center>
            </Col>
           </Row>
        </div>
      );
    }
  }
}

module.exports = Login;
