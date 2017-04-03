import React from 'react'
import {Glyphicon} from 'react-bootstrap'
import style from './Style'

class GroupItem extends React.Component {
  /**
   * @description Generate the proper glyphicon based on selections
   * @param {array} selections - array of selection objects
   * @param {bool} active - whether or not the group is active/current
   * @return {component} statusGlyph - component to render
   */
  statusGlyph(selections, active) {
    let statusGlyph = <div /> // blank as default, in case no data or not active
    if (active && selections.length > 0) {
      statusGlyph = <Glyphicon glyph="ok" style={style.menuItem.statusIcon.correct} />
    }
    return statusGlyph
  }

  render() {
    let {selections} = this.props.selectionsReducer
    let {reference} = this.props.contextId

    let active = this.props.contextId == this.props.contextIdReducer.contextId

    return (
      <div onClick={() => this.props.actions.changeCurrentContextId(this.props.contextId)}
          style={active ? style.activeSubMenuItem : style.subMenuItem}
          title="Click to select this check">
          {this.statusGlyph(selections, active)}
          {" " + this.props.resourcesReducer.book + " " + reference.chapter + ":" + reference.verse}
      </div>
    );
  }
}

module.exports = GroupItem;
