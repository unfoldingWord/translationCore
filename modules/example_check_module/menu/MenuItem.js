// MenuItem.js//
//api imports
const api = window.ModuleApi;
const React = api.React;
const ReactBootstrap = api.ReactBootstrap;

const Glyphicon = ReactBootstrap.Glyphicon;
const style = require('./Style');

class MenuItem extends React.Component {
  constructor() {
    super();
    this.state = {
      checkStatus: "UNCHECKED"
    };
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

  changeCheckStatus(checkStatus) {
    this.setState({
      checkStatus: checkStatus
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      checkStatus: nextProps.check.checkStatus
    });
  }

  render() {
    var checkStatus = this.state.checkStatus;

    // Set the style of the menu item, depending on the check status
    var checkStatusStyle;
    var glyphIcon;
    switch(checkStatus) {
      case "YES":
        glyphIcon = "ok";
        checkStatusStyle = style.statusIcon.yes;
        break;
      case "NO":
        glyphIcon = "remove";
        checkStatusStyle = style.statusIcon.no;
        break;
      default:
        glyphIcon = '';
        checkStatusStyle = style.statusIcon.unchecked;
    }

    return (
      <span>
        <a style={style.text} onClick={this.menuItemClicked}>
          {this.props.book + " " + this.props.check.chapter + ":" + this.props.check.verse}
        </a>
        <Glyphicon glyph={glyphIcon} style={checkStatusStyle} />
      </span>
    );
  }

}

module.exports = MenuItem;
