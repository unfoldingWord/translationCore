import React from 'react'
import ReactDOM from 'react-dom';
import { Glyphicon } from 'react-bootstrap'
import { Circle } from 'react-progressbar.js'
import GroupItem from './GroupItem'
import * as Style from './Style'
import isEqual from 'lodash/isEqual'
import * as LoadHelpers from '../../helpers/LoadHelpers';

class Group extends React.Component {
  /**
   * @description filters groupData from groupsData to the this groupId
   * @param {array} groupsData - array of all groupData objects
   * @param {string} groupId - string name of a group.
   * @return {array} groupData - array of groupData objects
   */
  constructor(props) {
    super(props);
    this.getItemGroupData = this.getItemGroupData.bind(this);
  }
  

  groupData(groupsData, groupId) {
    let groupData
    if (groupsData !== undefined) {
      groupData = groupsData[groupId]
    }
    return groupData
  }
  /**
   * @description generates the total progress for the group.
   * @return {number} - progress percentage.
   */
  generateProgress() {
    let { groupsData } = this.props.groupsDataReducer
    let groupId = this.props.groupIndex.id
    let totalChecks = groupsData[groupId].length
    let doneChecks = 0

    groupsData[groupId].forEach(function (groupData) {
      if (groupData.selections && !groupData.reminders) {
        doneChecks++
      }
    }, this);

    let progress = doneChecks / totalChecks

    return progress
  }
  /**
   * @description Maps all groupData aka check objects to GroupItem components
   * @param {array} groupData - array of all groupData objects
   * @param {bool} active - whether or not the group is active/current
   * @return {array} groupItems - array of groupData mapped to GroupItem components
   */
  groupItems(groupData) {
    let items = [];
    let index = 0;
    for (var groupItemData of groupData) {
      let active = isEqual(groupItemData.contextId, this.props.contextIdReducer.contextId);
      let bookName = this.props.projectDetailsReducer.bookName;
      if (active){
        let bookAbbr = this.props.projectDetailsReducer.params.bookAbbr;
        bookName = bookAbbr.charAt(0).toUpperCase() + bookAbbr.slice(1);
      }
      items.push(<GroupItem 
        statusGlyph={this.statusGlyph(groupItemData.contextId)} 
        groupMenuHeader={this} 
        scrollIntoView={this.scrollIntoView} {...this.props} 
        active={active} {...groupItemData} 
        key={index} bookName={bookName} />)
      index++
    }
    return items;
  }

  scrollIntoView(element) {
    ReactDOM.findDOMNode(element).scrollIntoView({ block: 'end', behavior: 'smooth' });
  }

  statusGlyph(contextId) {
    let statusBooleans = this.getItemGroupData(contextId)
    let { comments, reminders, selections, verseEdits } = statusBooleans
    let statusGlyph = (
      <Glyphicon glyph="" style={Style.menuItem.statusIcon.blank} /> // blank as default, in case no data or not active
    )
    if (reminders) {
      statusGlyph = (
        <Glyphicon glyph="bookmark" style={Style.menuItem.statusIcon.bookmark} />
      )
    } else if (selections) {
      statusGlyph = (
        <Glyphicon glyph="ok" style={Style.menuItem.statusIcon.correct} />
      )
    } else if (verseEdits) {
      statusGlyph = (
        <Glyphicon glyph="pencil" style={Style.menuItem.statusIcon.verseEdit} />
      )
    } else if (comments) {
      statusGlyph = (
        <Glyphicon glyph="comment" style={Style.menuItem.statusIcon.comment} />
      )
    }
    return statusGlyph
  }

  /**
 * @description gets the group data for the groupItem.
 * @return {object} groud data object.
 */
  getItemGroupData(contextId) {
    let { groupsData } = this.props.groupsDataReducer
    let groupId = this.props.groupIndex.id

    let groupData = groupsData[groupId].filter(groupData => {
      return isEqual(groupData.contextId, contextId)
    })

    return groupData[0];
  }

  onClick() {
    this.props.actions.changeCurrentContextId(this.props.contextId);
  }

  render() {
    let { groupsData } = this.props.groupsDataReducer
    let { contextId } = this.props.contextIdReducer
    let groupId = this.props.groupIndex.id
    let groupData = this.groupData(groupsData, groupId)

    let style = this.props.active ? Style.menuItem.heading.current : Style.menuItem.heading.normal
    let expandedGlyph = <Glyphicon glyph="chevron-down" style={{ float: 'right', marginTop: '3px' }} />
    let collapsedGlyph = <Glyphicon glyph="chevron-right" style={{ float: 'right', marginTop: '3px' }} />
    let progress = this.generateProgress();
    return (
      <div>
        <div style={style} onClick={() => this.props.actions.changeCurrentContextId(groupData[0].contextId)} >
          {this.props.active ? expandedGlyph : collapsedGlyph}
          <Circle
            progress={progress}
            options={{ strokeWidth: 15, color: "var(--accent-color-light)", trailColor: "var(--reverse-color)", trailWidth: 15 }}
            initialAnimate={false}
            containerStyle={{ width: '20px', height: '20px', marginRight: '10px', float: 'left' }}
          />
          {this.props.groupIndex.name}
        </div>
        {this.props.active && groupData ? this.groupItems(groupData) : null}
      </div>
    );
  }

}

module.exports = Group;
