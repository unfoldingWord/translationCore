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
          <MenuHeadersItems onClick={this.props.menuClick} {...this.props} {...menuItem} id={i} key={i} ref={menuItem.group.toString()} />
        );
      }
    }
    return (
      <table style={{ color: "#FFF" }}>
        <tbody>
          {groupsName}
        </tbody>
      </table>
    );
  }

}


module.exports = MenuHeaders;
