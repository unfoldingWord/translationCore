// SubMenu.js//
//api imports
const api = window.ModuleApi;
const React = api.React;
const ReactBootstrap = api.ReactBootstrap;
const CoreStore = require('../../../stores/CoreStore.js');
const SubMenuItem = require('./SubMenuItem');


class SubMenu extends React.Component {
  updateSubMenuItem(params) {
    if (params) {
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

  goToNext() {
    let currentNamespace = CoreStore.getcurrentCheckNamespace();
    let groupName = api.getCurrentGroupName();
    let groups = api.getDataFromCheckStore(currentNamespace, 'groups');
    if (groups) {
      let foundGroup = groups.find(arrayElement => arrayElement.group === groupName);
      this.unselectOldMenuItem();
      //if we need to move to the next group
      if (this.currentCheckIndex >= foundGroup.checks.length - 1) {
        // if we're not on the last group
        if (this.currentGroupIndex < foundGroup.length - 1) {
          this.currentGroupIndex++;
          this.currentCheckIndex = 0;
        }
      } else { // if we still have more in the group*/
        this.currentCheckIndex++;
      }
      this.selectNewMenuItem();
    }
  }

  goToPrevious() {
    let currentNamespace = CoreStore.getcurrentCheckNamespace();
    let groupName = api.getCurrentGroupName();
    let groups = api.getDataFromCheckStore(currentNamespace, 'groups');
    if (groups) {
      let foundGroup = groups.find(arrayElement => arrayElement.group === groupName);
      this.unselectOldMenuItem();
      //if we need to move to the previous group
      if (this.currentCheckIndex <= 0) {
        //if we're not on the first group
        if (this.currentGroupIndex > 0) {
          this.currentGroupIndex--;
          this.currentCheckIndex = foundGroup.checks.length - 1;
        }
      } else {  //if we still have more in the group*/
        this.currentCheckIndex--;
      }
      this.selectNewMenuItem();
    }
  }

  selectNewMenuItem() {
    this.refs[`${this.currentGroupIndex} ${this.currentCheckIndex}`].setIsCurrentCheck(true);
  }

  render() {
    let subMenuItems = [];
    if (this.props.currentGroupIndex !== null) {
      for (var i in this.props.currentSubGroupObjects) {
        const item = this.props.currentSubGroupObjects[i];
        item.checkStatus = item.checkStatus || "UNCHECKED";
        item.isCurrentItem = this.props.isCurrentSubMenu == i;
        subMenuItems.push(
          <SubMenuItem key={i} {...item} id={i} checkClicked={this.props.checkClicked} groupIndex={this.props.currentGroupIndex}
            ref={this.props.currentGroupIndex.toString() + ' ' + i.toString()} {...this.props}
            currentToolNamespace={this.props.currentToolNamespace}
          />
        );
      }
    }
    return (
      <table style={{ width: "100%" }}>
        <tbody>
          {subMenuItems}
        </tbody>
      </table>
    );
  }
}

module.exports = SubMenu;
