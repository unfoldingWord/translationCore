const React = require('react');
const Navbar = require('react-bootstrap/lib/Navbar');
const NavItem = require('react-bootstrap/lib/NavItem');
const Nav = require('react-bootstrap/lib/Nav');
const OnlineStatus = require('./OnlineStatus');
const style = require('../../styles/loginStyle');

class NavBarComponent extends React.Component{
  render(){
    return(
      <div style={style.bar}>
      <Navbar inverse style={style.navbar}>
        <Navbar.Header>
          <Navbar.Brand>
            <img src="images/TC_Icon_logo.png" style={style.logo}/>
          </Navbar.Brand>
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav pullRight>
            <OnlineStatus />
          </Nav>
          <Nav pullRight>

          </Nav>
        </Navbar.Collapse>
      </Navbar>
      </div>
    );
  }
}

module.exports = NavBarComponent;
