const api = window.ModuleApi;
const React = api.React;
const style = require('./Style');
const ProgressBar = require('react-progressbar.js');
const Circle = ProgressBar.Circle;
const MenuHeadersItems = require('./MenuHeadersItem');

class MenuHeaders extends React.Component {
  render() {
    let { groups, currentGroupIndex, currentCheckIndex } = this.props;
    let subGroupObjects = {};
    if(groups != null && currentGroupIndex != null){
      subGroupObjects = groups[currentGroupIndex]['checks'];
    }
    var groupsName = [];
    if (this.props.currentToolNamespace) {
      for (var i in groups) {
        const menuItem = groups[i];
        menuItem.isCurrentItem = currentGroupIndex == i;
        menuItem.currentGroupprogress = menuItem.currentGroupprogress || 0;
        menuItem.open = this.props.subMenuOpen;
        groupsName.push(
          <MenuHeadersItems
              key={i}
              id={i}
              menuClick={this.props.menuClick}
              checkClicked={this.props.checkClicked}
              currentToolNamespace={this.props.currentToolNamespace}
              {...menuItem}
              ref={menuItem.group.toString()}
              currentBookName={this.props.book}
              isCurrentSubMenu={currentCheckIndex}
              currentSubGroupObjects={subGroupObjects}
              currentCheckIndex={currentCheckIndex}
              currentGroupIndex={currentGroupIndex}
          />
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
