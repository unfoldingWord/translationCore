
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
        <SubMenu ref='submenu' checkClicked={this.props.subMenuProps.checkClicked} currentBookName={this.props.currentBookName}
                 currentSubGroupObjects={this.props.currentSubGroupObjects}
                 currentCheckIndex={this.props.currentCheckIndex}
                 currentGroupIndex={this.props.currentGroupIndex}/>
      </div>
    );
  }
}

module.exports = NavigationMenu;
