var React = require('react');
var ReactDOM = require('react-dom');

class SideBar extends React.Component{
    constructor(){
      super();
      this.state = {
        visibleBurgerMenu: false
      };
    }

    _handleClick(){
      this.setState({visibleBurgerMenu: !this.state.visibleBurgerMenu});
    }

    _getMenu(){
      return(
        <div className='burgerBody'>
        <ul>
          <li><a href="#">Burger 1</a></li>
          <li><a href="#">Burger 2</a></li>
        </ul>

        </div>
        );
    }

    render(){
      const burgerMenu = this._getMenu();
      let burgerMenuNodes;

      if(this.state.visibleBurgerMenu){
        burgerMenuNodes = <div className="menu">{burgerMenu}</div>;
      }
      return(
          <div className="burgerButton">
          <button onClick={this._handleClick.bind(this)}>Burger</button>
          {burgerMenuNodes}
          </div>
      );
    }

}
module.exports = SideBar;
