const React = require('react');
const CoreActions = require('../actions/CoreActions.js');

const Navbar = require('react-bootstrap/lib/Navbar');
const NavItem = require('react-bootstrap/lib/NavItem');
const Nav = require('react-bootstrap/lib/Nav');
const Toggle= require('../components/Toggle');
const style = require('../styles/loginStyle');

class NavBar extends React.Component{
  displayLogin(){
    CoreActions.updateLoginModal(true);
  }
  render(){
    const toggle = <Toggle />;
    return(
      <div>
      <Navbar inverse>
        <Navbar.Header>
          <Navbar.Brand>
            <a href="#"><img src="../8woc/images/TC_Icon.png" style={style.image}/></a>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav pullRight>
          {toggle}
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      </div>
    );
  }
}


module.exports = NavBar;
