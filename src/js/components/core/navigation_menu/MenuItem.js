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
      isCurrentCheck: false
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
    this.setIsCurrentCheck(true);
  }
  
  setIsCurrentCheck(isCurrentCheck) {
    this.setState({isCurrentCheck: isCurrentCheck});
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

    // Set the style of the menu item, depending on the check status
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
    // Set the style of the text, depending on whether this menu item represents the current check
    var textStyle = this.state.isCurrentCheck ? style.menuItem.text.current : style.menuItem.text.normal;

    return (
      <span>
        <a style={textStyle} onClick={this.menuItemClicked}>
          {this.props.book + " " + this.props.check.chapter + ":" + this.props.check.verse}
        </a>
        <Glyphicon glyph={glyphIcon} style={checkStatusStyle} />
      </span>
    );
  }

}

module.exports = MenuItem;
