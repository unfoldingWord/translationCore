import React from 'react'
import ReactDOM from 'react-dom';
import { Glyphicon } from 'react-bootstrap'
import style from './Style';
const MENU_BAR_HEIGHT = 30;
const MENU_ITEM_HEIGHT = 38;

class GroupItem extends React.Component {
  /**
   * @description Generate the proper glyphicon based on selections
   * @return {component} statusGlyph - component to render
   */
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  componentDidMount() {
    if (this.props.active) {
      if (this.inView(this.props.groupMenuHeader, this)) {
        //If the menu and current check are able to be rendered in the 
        //same window scroll to the group menu item
        this.props.scrollIntoView(this.props.groupMenuHeader);
      }
      else {
        //Scroll to the current check item
        this.props.scrollIntoView(this);
      }
    }
  }

  componentWillReceiveProps(nextProps, context) {
    if (nextProps.active) {
      if (this.inView(nextProps.groupMenuHeader, this)) {
        //If the menu and current check are able to be rendered in the 
        //same window scroll to the group menu item
        nextProps.scrollIntoView(nextProps.groupMenuHeader);
      }
      else {
        //Scroll to the current check item
        nextProps.scrollIntoView(this);
      }
    }
  }

  /**
   * @description - Tests if the the two elements are in the scope of the window (scroll bar)
   * The consts MENU_BAR_HEIGHT & MENU_ITEM_HEIGHT are set to account for the static window avialablity 
   * @param {object} groupMenu - The current group menu header that is extended/actived (i.e. Metaphors)
   * @param {object} currentItem - The current group check item that is active (i.e. Luke 1:1)
   */
  inView(groupMenu, currentItem) {
    var rectGroup = ReactDOM.findDOMNode(groupMenu).getBoundingClientRect();
    var rectItem = ReactDOM.findDOMNode(currentItem).getBoundingClientRect();
    var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
    return Math.abs(rectGroup.top - rectItem.top) + MENU_BAR_HEIGHT + MENU_ITEM_HEIGHT <= viewHeight;
  }

  onClick() {
    this.props.actions.changeCurrentContextId(this.props.contextId);
  }

  render() {
    let { reference } = this.props.contextId;
    return (
      <div onClick={this.onClick}
        style={this.props.active ? style.activeSubMenuItem : style.subMenuItem}
        title="Click to select this check">
        {this.props.statusGlyph}
        {" " + this.props.bookName + " " + reference.chapter + ":" + reference.verse + this.props.selectionText}
      </div>
    );
  }
}

module.exports = GroupItem;
