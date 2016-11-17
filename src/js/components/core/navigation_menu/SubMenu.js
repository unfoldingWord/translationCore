// SubMenu.js//
//api imports
const api = window.ModuleApi;
const React = api.React;
const ReactBootstrap = api.ReactBootstrap;
const CoreStore = require('../../../stores/CoreStore.js');
const style = require('./Style');


class SubMenu extends React.Component {
  constructor(){
    super();
    this.state = {
    }
  }

  handleItemSelection(index){
    api.changeCurrentIndexes(index);
  }

  generateSubMenuButtons(){
    let subMenuItemsArray = this.props.subMenuItemsArray;
    let subMenuItems = [];
    let currentNamespace = CoreStore.getCurrentCheckNamespace();
    let bookName = api.getDataFromCheckStore(currentNamespace, 'book');
    for(var i in subMenuItemsArray){
      subMenuItems.push(
        <tr key={i}
            onClick={this.handleItemSelection.bind(this, i)}
            style={style.subMenuChecks}
            title="Click to select this check">
          {bookName + " " + subMenuItemsArray[i].chapter + ":" +
            subMenuItemsArray[i].verse}
        </tr>
      );
    }
    return subMenuItems;
  }

  render() {
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
