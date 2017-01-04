// MenuHeaders.js//
//api imports
const api = window.ModuleApi;
const React = api.React;
const ReactBootstrap = api.ReactBootstrap;
const style = require('./Style');
const ProgressBar = require('react-progressbar.js');
const Circle = ProgressBar.Circle;

class MenuHeaders extends React.Component {
  render() {
    var groupsName = [];
    if (this.props.currentToolNamespace) {
      for (var i in this.props.groupObjects) {
        const menuItem = this.props.groupObjects[i];
        menuItem.isCurrentItem = menuItem.isCurrentItem || false;
        menuItem.currentGroupprogress = menuItem.currentGroupprogress || 0;
        groupsName.push(
          <MenuHeadersItems {...this.props.menuHeadersItemsProps} {...menuItem} id={i} key={i} ref={menuItem.group.toString()} />
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

class MenuHeadersItems extends React.Component {
  render() {
    var itemStyle = this.props.isCurrentItem ? style.activeMenuHeader : style.menuHeader;
    return (
      <tr onClick={() => this.props.groupNameClicked(this.props.id)}
        style={itemStyle}
        title="Click to select this reference">
        <th>
          <Circle
            progress={this.props.currentGroupprogress}
            options={{
              strokeWidth: 15,
              color: "#4ABBE6",
              trailColor: "#FFF",
              trailWidth: 15
            }}
            initialAnimate={false}
            containerStyle={{
              width: '20px',
              height: '20px',
              marginRight: '5px'
            }}
            />
        </th>
        <td>
          {this.props.group}
        </td>
      </tr>
    );
  }
}


module.exports = MenuHeaders;
