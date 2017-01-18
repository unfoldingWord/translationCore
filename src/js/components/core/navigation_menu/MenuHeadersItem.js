
const api = window.ModuleApi;
const React = api.React;
const style = require('./Style');
const ProgressBar = require('react-progressbar.js');
const Circle = ProgressBar.Circle;

class MenuHeadersItems extends React.Component {
  render() {
    var itemStyle = this.props.isCurrentItem ? style.activeMenuHeader : style.menuHeader;
    return (
      <tr onClick={() => this.props.onClick(this.props.id)}
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

module.exports = MenuHeadersItems;