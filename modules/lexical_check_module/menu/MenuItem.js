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
      checkStatus: "UNCHECKED",
      active: "false"
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
    this.setActive(true);
  }

  setActive(active) {
    this.setState({active: active});
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

  componentWillMount() {
    this.setState({
      checkStatus: this.props.check.checkStatus
    });
  }

  render() {
    var checkStatus = this.state.checkStatus;

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
        <span>
          <Glyphicon glyph={glyphIcon} style={checkStatusStyle} />
        </span>{' '}
        <span style={this.state.active === true ? style.menuItem.current : style.menuItem.text}>
          <a onClick={this.menuItemClicked}>
            {this.props.book + " " + this.props.check.chapter + ":" + this.props.check.verse}
          </a>
        </span>
      </span>
    );
  }

}

module.exports = MenuItem;
