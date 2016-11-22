// SubMenuItem.js//
//api imports
const api = window.ModuleApi;
const React = api.React;
const RB = api.ReactBootstrap;
const {Glyphicon} = RB;
const CoreStore = require('../../../stores/CoreStore.js');
const style = require('./Style');


class SubMenuItem extends React.Component {
  constructor(){
    super();
    this.state = {
      checkStatus: "UNCHECKED",
      isCurrentItem: false,
    }
  }

  componentWillMount() {
    this.setState({checkStatus: this.props.check.checkStatus});
  }

  updateCheckStatus(){
    this.setState({checkStatus: this.props.check.checkStatus});
  }

  getItemStatus() {
    var groups = api.getDataFromCheckStore(this.props.currentNamespace, 'groups');
    var currentCheck = groups[this.props.groupIndex]['checks'][this.props.checkIndex];
    var checkStatus = currentCheck.checkStatus;
    this.setState({checkStatus: checkStatus});
  }

  ItemClicked() {
    this.props.handleItemSelection();
    this.setIsCurrentCheck(true);
  }

  setIsCurrentCheck(status){
    this.setState({isCurrentItem: status});
  }

  render() {
    var checkStatus = this.state.checkStatus;
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
    var itemStyle = this.state.isCurrentItem ? style.subMenuActiveCheck : style.subMenuChecks;
    return (
      <tr onClick={this.ItemClicked.bind(this)}
          style={itemStyle}
          title="Click to select this check">
        <td>
          <Glyphicon glyph={glyphIcon} style={checkStatusStyle} />
          {" " + this.props.bookName + " " + this.props.check.chapter + ":" + this.props.check.verse}
        </td>
      </tr>
    );
  }
}

module.exports = SubMenuItem;
