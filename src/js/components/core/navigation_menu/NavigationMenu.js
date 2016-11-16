const React = require('react');
const Well = require('react-bootstrap/lib/Well.js');

// const MenuItem = require('./MenuItem');
const api = window.ModuleApi;
const SubMenu = require('./SubMenu.js');


class NavigationMenu extends React.Component {
  constructor() {
    super();
    this.state = {
      subMenuItemsArray: null,
      checkMenu: null
    };
    this.getSubMenuItemsFromCheckStore = this.getSubMenuItemsFromCheckStore.bind(this);
}

  componentWillMount() {
    api.registerEventListener('goToNext', this.getSubMenuItemsFromCheckStore);
    api.registerEventListener('goToPrevious', this.getSubMenuItemsFromCheckStore);
    api.registerEventListener('goToCheck', this.getSubMenuItemsFromCheckStore);
    api.registerEventListener('changeCheckType', this.getSubMenuItemsFromCheckStore);
  }

  componentWillUnmount() {
    api.removeEventListener('goToNext', this.getSubMenuItemsFromCheckStore);
    api.removeEventListener('goToPrevious', this.getSubMenuItemsFromCheckStore);
    api.removeEventListener('goToCheck', this.getSubMenuItemsFromCheckStore);
    api.removeEventListener('changeCheckType', this.getSubMenuItemsFromCheckStore);
  }

  getSubMenuItemsFromCheckStore(){
    let subMenuItemsArray = api.getSubMenuItems();
    console.log(subMenuItemsArray);
    this.setState({subMenuItemsArray: subMenuItemsArray});
  }

  render() {
    return (
      <div>
        <SubMenu subMenuItemsArray={this.state.subMenuItemsArray}/>
      </div>
    );
  }
}

module.exports = NavigationMenu;
