// SubMenu.js//
//api imports
const api = window.ModuleApi;
const React = api.React;
const ReactBootstrap = api.ReactBootstrap;
const CoreStore = require('../../../stores/CoreStore.js');
const style = require('./Style');
const SubMenuItem = require('./SubMenuItem');


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
        <SubMenuItem key={i}
            handleItemSelection={this.handleItemSelection.bind(this, i)}
            style={style.subMenuChecks}
            title="Click to select this check"
            bookName={bookName} chapter={subMenuItemsArray[i].chapter}
            verse={subMenuItemsArray[i].verse}/>
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
