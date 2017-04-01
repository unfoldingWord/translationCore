// SubMenuItem.js//
//api imports
import React from 'react'
import {Glyphicon} from 'react-bootstrap'
import style from './Style'

class GroupItem extends React.Component {
  render() {
    let active = this.props.contextId == this.props.contextIdReducer.contextId
    let {selections} = this.props.selectionsReducer
    let itemStyle = active ? style.activeSubMenuItem : style.subMenuItem;
    let {reference} = this.props.contextId
    let statusGlyph = <div />
    if (active && selections.length > 0) {
      statusGlyph = <Glyphicon glyph="ok" style={style.menuItem.statusIcon.correct} />
    }
    return (
      <div onClick={() => this.props.actions.changeCurrentContextId(this.props.contextId)}
          style={itemStyle}
          title="Click to select this check">
          {statusGlyph}
          {" " + this.props.resourcesReducer.book + " " + reference.chapter + ":" + reference.verse}
      </div>
    );
  }
}

module.exports = GroupItem;
