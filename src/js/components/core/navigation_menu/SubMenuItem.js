// SubMenuItem.js//
//api imports
const api = window.ModuleApi;
const React = api.React;
const RB = api.ReactBootstrap;
const {Glyphicon} = RB;
const CoreStore = require('../../../stores/CoreStore.js');
const style = require('./Style');


class SubMenuItem extends React.Component {
  // constructor(){
  //   super();
  //   this.state = {
  //     checkStatus: "UNCHECKED",
  //     isCurrentItem: false,
  //   }
  // }

  // componentWillMount() {
  //   this.setState({checkStatus: this.props.check.checkStatus});
  // }

  // componentWillReceiveProps(nextProps){
  //   this.setState({checkStatus: nextProps.check.checkStatus});
  //   if(this.state.isCurrentItem){
  //     this.setIsCurrentCheck(false);
  //   }
  // }

  // itemClicked() {
  //   this.props.handleItemSelection();
  //   this.setIsCurrentCheck(true);
  // }

  // setIsCurrentCheck(status){
  //   this.setState({isCurrentItem: status});
  // }

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
      <tr onClick={() => this.props.checkClicked(this.props.id)}
          style={itemStyle}
          title="Click to select this check">
        <td>
          <Glyphicon glyph={glyphIcon} style={checkStatusStyle} />
          {" " + this.props.bookName + " " + this.props.chapter + ":" + this.props.verse}
        </td>
      </tr>
    );
  }
}

module.exports = SubMenuItem;
