const React = require('react');
const CoreActions = require('../actions/CoreActions.js');

const Navbar = require('react-bootstrap/lib/Navbar');
const NavItem = require('react-bootstrap/lib/NavItem');
const Nav = require('react-bootstrap/lib/Nav');


class NavBar extends React.Component{
  displayLogin(){
    CoreActions.updateLoginModal(true);
  }
  render(){
    return(
      <div>
      <Navbar inverse>
        <Navbar.Header>
          <Navbar.Brand>
            <a href="#">Menu</a>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav pullRight>
            <NavItem eventKey={1} href="#">Work Offline</NavItem>
            <NavItem eventKey={2} onClick={this.displayLogin.bind(this)}>Login</NavItem>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      </div>
    );
  }
}


module.exports = NavBar;
