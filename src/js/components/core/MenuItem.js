// MenuItem.js
const Glyphicon = require('react-bootstrap/lib/Glyphicon.js');
const React = require('react');
const ReactDOM = require('react-dom');

const style = require('./Style');
const api = window.ModuleApi;

class MenuItem extends React.Component {
  constructor() {
    super();
    this.menuItemClicked = this.menuItemClicked.bind(this);
  }

  menuItemClicked() {
    api.emitEvent('goToCheck',
      {
        'groupIndex': this.props.groupIndex,
        'checkIndex': this.props.checkIndex
      }
    );
  }

  render() {
    var checkStatus = this.props.check.checkStatus;

    // when the flag is toggled it turns blue
    var flagStyle;
    if (this.props.check.flagged) {
      flagStyle = style.menuItem.flag.enabled;
    }
    else {
      flagStyle = style.menuItem.flag.disabled;
    }

    var checkStatusStyle;
    var glyphIcon;
    switch(checkStatus) {
      case "RETAINED":
        glyphIcon = "ok";
        checkStatusStyle = style.menuItem.statusIcon.retained;
        break;
      case "REPLACED":
        glyphIcon = "random";
        checkStatusStyle = style.menuItem.statusIcon.replaced;
        break;
      case "WRONG":
        glyphIcon = "remove";
        checkStatusStyle = style.menuItem.statusIcon.wrong;
        break;
      default:
        glyphIcon = '';
        checkStatusStyle = style.menuItem.statusIcon.unchecked;
    }

    return (
      <span>
        <Glyphicon glyph="flag" style={flagStyle} />
        <span style={style.menuItem.text}>
          <a onClick={this.menuItemClicked}>
            {this.props.check.book + " " + this.props.check.chapter + ":" + this.props.check.verse}
          </a>
        </span>
        <span>
          <Glyphicon glyph={glyphIcon} style={checkStatusStyle} />
        </span>
      </span>
    );
  }

}

module.exports = MenuItem;
