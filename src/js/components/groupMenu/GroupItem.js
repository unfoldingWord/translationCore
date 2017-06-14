import React from 'react'
import { Glyphicon } from 'react-bootstrap'
import style from './Style'
import isEqual from 'lodash/isEqual'

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
      this.props.scrollIntoView(this);
    }
  }

  componentWillReceiveProps(nextProps, context) {
    if (isEqual(nextProps.contextId, nextProps.contextIdReducer.contextId)) {
      this.props.scrollIntoView(this);
    }
  }

  statusGlyph() {
    let statusBooleans = this.getGroupData()
    let { comments, reminders, selections, verseEdits } = statusBooleans
    let statusGlyph = (
      <Glyphicon glyph="" style={style.menuItem.statusIcon.blank} /> // blank as default, in case no data or not active
    )
    if (reminders) {
      statusGlyph = (
        <Glyphicon glyph="bookmark" style={style.menuItem.statusIcon.bookmark} />
      )
    } else if (selections) {
      statusGlyph = (
        <Glyphicon glyph="ok" style={style.menuItem.statusIcon.correct} />
      )
    } else if (verseEdits) {
      statusGlyph = (
        <Glyphicon glyph="pencil" style={style.menuItem.statusIcon.verseEdit} />
      )
    } else if (comments) {
      statusGlyph = (
        <Glyphicon glyph="comment" style={style.menuItem.statusIcon.comment} />
      )
    }
    return statusGlyph
  }
  /**
   * @description gets the group data for the groupItem.
   * @return {object} groud data object.
   */
  getGroupData() {
    let { groupsData } = this.props.groupsDataReducer
    let groupId = this.props.groupIndex.id

    let groupData = groupsData[groupId].filter(groupData => {
      return isEqual(groupData.contextId, this.props.contextId)
    })

    return groupData[0];
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
        {this.statusGlyph()}
        {" " + this.props.projectDetailsReducer.bookName + " " + reference.chapter + ":" + reference.verse}
      </div>
    );
  }
}

module.exports = GroupItem;
