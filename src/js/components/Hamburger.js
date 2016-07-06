
const React = require("react");

class Hamburger extends React.Component{
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
        <div>
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

module.exports = Hamburger;
