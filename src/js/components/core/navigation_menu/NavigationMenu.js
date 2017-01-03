
// const MenuItem = require('./MenuItem');
const api = window.ModuleApi;
const React = api.React;
const RB = api.ReactBootstrap;
const {Well} = RB;
const CoreStore = require('../../../stores/CoreStore.js');
const SubMenu = require('./SubMenu.js');


class NavigationMenu extends React.Component {
  constructor() {
    super();
    this.state = {
      subMenuItemsArray: null,
      checkMenu: null,
      currentCheckIndex: null,
      currentGroupIndex: null,
    };
    this.getSubMenuItemsFromCheckStore = this.getSubMenuItemsFromCheckStore.bind(this);
}

  componentWillMount() {
    api.registerEventListener('goToNext', this.getSubMenuItemsFromCheckStore);
    api.registerEventListener('goToPrevious', this.getSubMenuItemsFromCheckStore);
    api.registerEventListener('goToCheck', this.getSubMenuItemsFromCheckStore);
    api.registerEventListener('changeCheckType', this.getSubMenuItemsFromCheckStore);
    api.registerEventListener('changeGroupName', this.getSubMenuItemsFromCheckStore);
  }

  componentWillUnmount() {
    api.removeEventListener('goToNext', this.getSubMenuItemsFromCheckStore);
    api.removeEventListener('goToPrevious', this.getSubMenuItemsFromCheckStore);
    api.removeEventListener('goToCheck', this.getSubMenuItemsFromCheckStore);
    api.removeEventListener('changeCheckType', this.getSubMenuItemsFromCheckStore);
    api.removeEventListener('changeGroupName', this.getSubMenuItemsFromCheckStore);
  }

  getSubMenuItemsFromCheckStore(){
    let currentNamespace = CoreStore.getCurrentCheckNamespace();
    let currentCheckIndex = api.getDataFromCheckStore(currentNamespace, 'currentCheckIndex');
    let currentGroupIndex = api.getDataFromCheckStore(currentNamespace, 'currentGroupIndex');
    this.setState({currentCheckIndex: currentCheckIndex});
    this.setState({currentGroupIndex: currentGroupIndex});
  }

  render() {
    return (
      <div>
        <SubMenu ref='submenu' subMenuItemsProps={this.props.subMenuItemsProps} {...this.props.subMenuProps} 
                 subMenuItemsArray={this.props.subMenuProps.subMenuItems}
                 currentCheckIndex={this.state.currentCheckIndex}
                 currentGroupIndex={this.state.currentGroupIndex}/>
      </div>
    );
  }
}

module.exports = NavigationMenu;
