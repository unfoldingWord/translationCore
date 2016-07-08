const React = require('react');

const FormGroup = require('react-bootstrap/lib/FormGroup.js');
const ControlLabel = require('react-bootstrap/lib/ControlLabel.js');
const FormControl = require('react-bootstrap/lib/FormControl.js');
const style = require('../styles/loginStyle');
const Button = require('react-bootstrap/lib/Button.js');
const Grid = require('react-bootstrap/lib/Grid.js');
const Row = require('react-bootstrap/lib/Row.js');
const Col = require('react-bootstrap/lib/Col.js');


class Login extends React.Component{
  handleSubmit(event){
    event.preventDefault();//prevents page from reloading
    let userName = this._userName;
    let password = this._password;
  }

  render(){
    return(
      <Grid>
        <Row className="show-grid">
          <Col md={4} sm={5} xs={12} style={style.loginGridLeft}>
            <form>
              <FormGroup controlId="login-form">
                <ControlLabel>Door43 Account</ControlLabel>
                  <FormControl type="text" placeholder="Door43 Account" style={style.loginbox.input} />
                  <FormControl type="password" placeholder="Password" style={style.loginbox.input} />
              </FormGroup>
              <Button bsStyle="primary" type="submit"
              onClick={this.handleSubmit.bind(this)}
              style={style.footer.button}>Login</Button>
            </form>
          </Col>
          <Col md={4} sm={4} xs={12} style={style.loginGridRight}>
            <Button type="submit">Create Account</Button>
          </Col>
         </Row>
      </Grid>
    );
  }
}

module.exports = Login;
