// SubMenu.js//
//api imports
const api = window.ModuleApi;
const React = api.React;
const ReactBootstrap = api.ReactBootstrap;
const CoreStore = require('../../../reducers/coreStoreReducer');
const SubMenuItem = require('./SubMenuItem');


class SubMenu extends React.Component {
  constructor(){
    super();
    this.currentCheckIndex = null;
    this.currentGroupIndex = null;
    this.updateSubMenuItem = this.updateSubMenuItem.bind(this);
    this.goToCheck = this.goToCheck.bind(this);
    this.goToNext = this.goToNext.bind(this);
    this.goToPrevious = this.goToPrevious.bind(this);
  }

  componentWillMount(){
    api.registerEventListener('changedCheckStatus', this.updateSubMenuItem);
    api.registerEventListener('goToCheck', this.goToCheck);
    api.registerEventListener('goToNext', this.goToNext);
    api.registerEventListener('goToPrevious', this.goToPrevious);
  }

  componentWillUnmount() {
    api.removeEventListener('changedCheckStatus', this.updateSubMenuItem);
    api.removeEventListener('goToCheck', this.goToCheck);
    api.removeEventListener('goToNext', this.goToNext);
    api.removeEventListener('goToPrevious', this.goToPrevious);
  }

  updateSubMenuItem(params){
    if(params){
      var menuItem = this.refs[params.groupIndex.toString() + ' ' + params.checkIndex.toString()];
      menuItem.getItemStatus(params.checkStatus);
    }
  }

  goToCheck(params) {
    this.unselectOldMenuItem();
    this.currentGroupIndex = params.groupIndex;
    this.currentCheckIndex = params.checkIndex;
    this.selectNewMenuItem();
  }

  goToNext(){
    let currentNamespace = CoreStore.getCurrentCheckNamespace();
    let groupName = api.getCurrentGroupName();
    let groups = api.getDataFromCheckStore(currentNamespace, 'groups');
    if(groups){
      let foundGroup = groups.find(arrayElement => arrayElement.group === groupName);
      this.unselectOldMenuItem();
      //if we need to move to the next group
      if (this.currentCheckIndex >= foundGroup.checks.length - 1) {
      // if we're not on the last group
        if (this.currentGroupIndex < foundGroup.length - 1) {
          this.currentGroupIndex++;
          this.currentCheckIndex = 0;
        }
      }else { // if we still have more in the group*/
      this.currentCheckIndex++;
      }
      this.selectNewMenuItem();
    }
  }

  goToPrevious() {
    let currentNamespace = CoreStore.getCurrentCheckNamespace();
    let groupName = api.getCurrentGroupName();
    let groups = api.getDataFromCheckStore(currentNamespace, 'groups');
    if(groups){
      let foundGroup = groups.find(arrayElement => arrayElement.group === groupName);
      this.unselectOldMenuItem();
      //if we need to move to the previous group
      if (this.currentCheckIndex <= 0) {
        //if we're not on the first group
        if (this.currentGroupIndex > 0) {
          this.currentGroupIndex--;
          this.currentCheckIndex = foundGroup.checks.length - 1;
        }
      }else {  //if we still have more in the group*/
        this.currentCheckIndex--;
      }
      this.selectNewMenuItem();
    }
  }

  unselectOldMenuItem() {
    this.refs[`${this.currentGroupIndex} ${this.currentCheckIndex}`].setIsCurrentCheck(false);
  }

  selectNewMenuItem() {
    this.refs[`${this.currentGroupIndex} ${this.currentCheckIndex}`].setIsCurrentCheck(true);
  }

  handleItemSelection(checkIndex){
    api.changeCurrentIndexes(checkIndex);
    var newItem = this.refs[`${this.currentGroupIndex} ${this.currentCheckIndex}`];
    var element = api.findDOMNode(newItem);
    if (element) {
      element.scrollIntoView();
    }
  }

  render() {
    this.currentCheckIndex = this.props.currentCheckIndex;
    this.currentGroupIndex = this.props.currentGroupIndex;
    let subMenuItemsArray = this.props.subMenuItemsArray;
    let subMenuItems = [];
    let currentNamespace = CoreStore.getCurrentCheckNamespace();
    let bookName = api.getDataFromCheckStore(currentNamespace, 'book');
    let groupIndex = api.getCurrentGroupIndex();
    if(groupIndex !== null){
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
    }
    return (
      <table>
        <tbody>
          {subMenuItems}
        </tbody>
      </table>
    );
  }
}

module.exports = SubMenu;
