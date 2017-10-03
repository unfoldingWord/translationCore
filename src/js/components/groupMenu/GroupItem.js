import React from 'react';
import PropTypes from 'prop-types';
import style from './Style';

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
      if (this.props.inView(this.props.groupMenuHeader, this)) {
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

  componentWillReceiveProps(nextProps) {
    if (nextProps.active) {
      if (this.props.inView(nextProps.groupMenuHeader, this)) {
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

  onClick() {
    this.props.actions.changeCurrentContextId(this.props.contextId);
  }

  render() {
    let { reference } = this.props.contextId;
    return (
      <div className="hint--bottom hint--medium" aria-label={this.props.selectionText} onClick={this.onClick} 
        style={this.props.active ? style.activeSubMenuItem : style.subMenuItem}>
        {this.props.statusGlyph}
         {reference.chapterVerseMenu ? 
            <span style={style.groupItemText}>
              {`${reference.text} ${reference.verse}` }
            </span>
          :
            <span style={style.groupItemText}>
              {" " + this.props.bookName + " " + reference.chapter + ":" + reference.verse + " " + this.props.selectionText}
            </span>
         }
      </div>
    );
  }
}

GroupItem.propTypes = {
    bookName: PropTypes.any.isRequired,
    selectionText: PropTypes.any.isRequired,
    contextId: PropTypes.any.isRequired,
    actions: PropTypes.shape({
        changeCurrentContextId: PropTypes.func.isRequired
    }),
    statusGlyph: PropTypes.any.isRequired,
    scrollIntoView: PropTypes.func.isRequired,
    inView: PropTypes.func.isRequired,
    active: PropTypes.any.isRequired,
    groupMenuHeader: PropTypes.any.isRequired
};

module.exports = GroupItem;
