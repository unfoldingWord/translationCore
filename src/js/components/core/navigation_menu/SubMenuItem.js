// SubMenuItem.js//
//api imports
const api = window.ModuleApi;
const React = api.React;
const RB = api.ReactBootstrap;
const {Glyphicon} = RB;
const CoreStore = require('../../../stores/CoreStore.js');
const style = require('./Style');


class SubMenuItem extends React.Component {
  render() {
    var checkStatus = this.props.checkStatus;
    // Set the style of the menu item, depending on the check status
    var checkStatusStyle;
    var glyphIcon;
    switch(checkStatus) {
      case "CORRECT":
        glyphIcon = "ok";
        checkStatusStyle = style.menuItem.statusIcon.correct;
        break;
      case "FLAGGED":
        glyphIcon = "flag";
        checkStatusStyle = style.menuItem.statusIcon.flagged;
        break;
      default:
        glyphIcon = '';
        checkStatusStyle = style.menuItem.statusIcon.unchecked;
    }
    var itemStyle = this.props.isCurrentItem ? style.activeSubMenuItem : style.subMenuItem;
    return (
      <tr onClick={() => this.props.checkClicked(this.props.currentGroupIndex, this.props.id)}
          style={itemStyle}
          title="Click to select this check">
        <td>
          <Glyphicon glyph={glyphIcon} style={checkStatusStyle} />
          {" " + this.props.currentBookName + " " + this.props.chapter + ":" + this.props.verse}
        </td>
      </tr>
    );
  }
}

module.exports = SubMenuItem;
