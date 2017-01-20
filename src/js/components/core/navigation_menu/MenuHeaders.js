const api = window.ModuleApi;
const React = api.React;
const style = require('./Style');
const ProgressBar = require('react-progressbar.js');
const Circle = ProgressBar.Circle;
const MenuHeadersItems = require('./MenuHeadersItem');

class MenuHeaders extends React.Component {
  render() {
    var groupsName = [];
    if (this.props.currentToolNamespace) {
      for (var i in this.props.currentGroupObjects) {
        const menuItem = this.props.currentGroupObjects[i];
        menuItem.isCurrentItem = this.props.isCurrentHeader == i;
        menuItem.currentGroupprogress = menuItem.currentGroupprogress || 0;
        groupsName.push(
          <MenuHeadersItems onClick={this.props.menuClick} subMenuProps={this.props.subMenuProps}
             {...menuItem} id={i} key={i} ref={menuItem.group.toString()} 
             currentBookName={this.props.currentBookName} isCurrentSubMenu={this.props.isCurrentSubMenu}
             currentSubGroupObjects={this.props.currentSubGroupObjects}
             currentCheckIndex={this.props.currentCheckIndex} currentGroupIndex={this.props.currentGroupIndex}/>
        );
      }
    }
    return (
      <table style={{ color: "#FFF", width:"100%"}}>
          {groupsName}
      </table>
    );
  }

}


module.exports = MenuHeaders;
