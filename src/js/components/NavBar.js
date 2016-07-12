const React = require('react');

const Navbar = require('react-bootstrap/lib/Navbar');
const NavItem = require('react-bootstrap/lib/NavItem');
const Nav = require('react-bootstrap/lib/Nav');
const Toggle= require('../components/Toggle');
const style = require('../styles/loginStyle');

class NavBar extends React.Component{
  render(){
    return(
      <div>
      <Navbar inverse>
        <Navbar.Header>
          <Navbar.Brand>
            <img src="../../../../images/TC_Icon.png" style={style.logo}/>
          </Navbar.Brand>
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav pullRight>
          <Toggle />
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      </div>
    );
  }
}


module.exports = NavBar;
