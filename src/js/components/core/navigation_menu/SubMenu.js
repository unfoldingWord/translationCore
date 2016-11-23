// SubMenu.js//
//api imports
const api = window.ModuleApi;
const React = api.React;
const ReactBootstrap = api.ReactBootstrap;
const CoreStore = require('../../../stores/CoreStore.js');
const SubMenuItem = require('./SubMenuItem');


class SubMenu extends React.Component {
  constructor(){
    super();
    this.state = {
    }
    this.currentCheckIndex = null;
    this.currentGroupIndex = null;
    this.updateSubMenuItem = this.updateSubMenuItem.bind(this);
    this.goToCheck = this.goToCheck.bind(this);
  }

  componentWillMount(){
    api.registerEventListener('changedCheckStatus', this.updateSubMenuItem);
    api.registerEventListener('goToCheck', this.goToCheck);
  }

  componentWillUnmount() {
    api.removeEventListener('changedCheckStatus', this.updateSubMenuItem);
    api.removeEventListener('goToCheck', this.goToCheck);
  }

  updateSubMenuItem(params){
    var menuItem = this.refs[params.groupIndex.toString() + ' ' + params.checkIndex.toString()];
    menuItem.getItemStatus(params.checkStatus);
  }

  goToCheck(params) {
    this.unselectOldMenuItem();
    this.currentGroupIndex = params.groupIndex;
    this.currentCheckIndex = params.checkIndex;
    this.selectNewMenuItem();
  }

  unselectOldMenuItem() {
    this.refs[`${this.currentGroupIndex} ${this.currentCheckIndex}`].setIsCurrentCheck(false);
  }

  selectNewMenuItem() {
    this.refs[`${this.currentGroupIndex} ${this.currentCheckIndex}`].setIsCurrentCheck(true);
  }

  handleItemSelection(checkIndex){
    api.changeCurrentIndexes(checkIndex);
  }

  generateSubMenuButtons(){
    let subMenuItemsArray = this.props.subMenuItemsArray;
    let subMenuItems = [];
    let currentNamespace = CoreStore.getCurrentCheckNamespace();
    let bookName = api.getDataFromCheckStore(currentNamespace, 'book');
    let groupIndex = api.getCurrentGroupIndex();
    for(var i in subMenuItemsArray){
      subMenuItems.push(
        <SubMenuItem key={i}
            handleItemSelection={this.handleItemSelection.bind(this, i)}
            bookName={bookName}
            check={subMenuItemsArray[i]}
            groupIndex={groupIndex}
            checkIndex={i}
            currentNamespace={currentNamespace}
            ref={groupIndex.toString() + ' ' + i.toString()}/>
      );
    }
    return subMenuItems;
  }

  render() {
    this.currentCheckIndex = this.props.currentCheckIndex;
    this.currentGroupIndex = this.props.currentGroupIndex;
    return (
      <table>
        <tbody>
          {this.generateSubMenuButtons()}
        </tbody>
      </table>
    );
  }
}

module.exports = SubMenu;
