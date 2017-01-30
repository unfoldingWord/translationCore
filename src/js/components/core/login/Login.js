import React from 'react';
const Registration = require('./Registration.js');
const { Button, Row, Col, FormGroup, FormControl, utils } = require('react-bootstrap/lib');
const bootstrapUtils = utils.bootstrapUtils;
bootstrapUtils.addStyle(Button, 'blue');
const style = require('./loginStyle');


class Login extends React.Component {
  render() {
    let { displayLogin } = this.props;
    if (!displayLogin) {
      return (
        <Col md={12} sm={12} xs={12} style={{marginTop: "50px"}}>
          <center>
            <Registration back={() => this.props.onSwitchToLoginPage(!displayLogin)}/>
          </center>
        </Col>
      );
    }else{
      return (
        <div>
          <style type="text/css">
            {`
              .btn-blue {
                background-color: #0277BD;
                color: white;
              }
              .btn-blue:hover {
                background-color: #C6C4C4;
              }
            `}
          </style>
          <Row className="show-grid">
            <Col md={12} sm={12} xs={12} style={{marginTop: "50px"}}>
            <center>
                <h4>Welcome!</h4>
                <FormGroup controlId="login-form">
                    <FormControl type="text" placeholder="Username"
                                 style={{width: '40%', margin: '15px'}}
                                 onChange={this.props.onHandleUserName}/>
                    <FormControl type="password"
                                 placeholder="Password"
                                 style={{width: '40%'}}
                                 onChange={this.props.onHandlePassword}/>
                </FormGroup>
                <Button bsStyle="blue"
                        type="submit"
                        onClick={() => {this.props.handleSubmit(this.props.userdata)}}
                        style={{width: '40%', fontWeight: 'bold', marginBottom: '50px'}}>
                        Sign In
                </Button>
                <h4>{"Don't have an account?"}</h4>
                <Button onClick={() => this.props.onSwitchToLoginPage(!displayLogin)}
                        bsStyle="blue"
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
