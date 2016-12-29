const React = require('react');
const FormGroup = require('react-bootstrap/lib/FormGroup.js');
const ControlLabel = require('react-bootstrap/lib/ControlLabel.js');
const FormControl = require('react-bootstrap/lib/FormControl.js');
const Button = require('react-bootstrap/lib/Button.js');
const Grid = require('react-bootstrap/lib/Grid.js');
const Row = require('react-bootstrap/lib/Row.js');
const Col = require('react-bootstrap/lib/Col.js');
const style = require('./loginStyle');

class Login extends React.Component {
  constructor() {
    super();
  }

  render() {
    if (this.props.register === true) {
      return (
        <Registration />
      );
    }else{
      return (
        <div>
          <Row className="show-grid">
            <Col md={12} sm={12} xs={12}>

                <FormGroup controlId="login-form">
                    <ControlLabel>Door43 Account</ControlLabel><br/><br/>
                    <FormControl type="text" placeholder="Username"
                                 style={{width: '100%', marginBottom: '10px'}}
                                 onChange={this.props.handleUserName}/>
                    <FormControl type="password"
                                 placeholder="Password"
                                 style={{width: '100%'}}
                                 onChange={this.props.handlePassword}/>
                </FormGroup>
                <Button bsStyle="primary"
                        type="submit"
                        onClick={() => {this.props.handleSubmit(this.props.userdata)}}
                        style={{width: '100%', margin: 'auto'}}>
                        Sign In
                </Button>

                <span>{"Don't have an account?"}</span>
                <Button onClick={this.props.showRegistration}
                        bsStyle="link"
                        style={{color: 'blue', display: 'inline'}}>
                        Register
                </Button><br/><br/>
            </Col>
           </Row>
        </div>
      );
    }
  }
}

module.exports = Login;
