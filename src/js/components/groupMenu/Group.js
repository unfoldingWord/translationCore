import React from 'react'
import ReactDOM from 'react-dom';
import { Glyphicon } from 'react-bootstrap'
import { Circle } from 'react-progressbar.js'
import GroupItem from './GroupItem'
import * as Style from './Style'
import isEqual from 'lodash/isEqual'

class Group extends React.Component {
  /**
   * @description filters groupData from groupsData to the this groupId
   * @param {array} groupsData - array of all groupData objects
   * @param {string} groupId - string name of a group.
   * @return {array} groupData - array of groupData objects
   */
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
      items.push(<GroupItem active={active} scrollIntoView={this.scrollIntoView} {...this.props} {...groupItemData} key={index} />)
      index++
    }
    return items;
  }

  scrollIntoView(element) {
    ReactDOM.findDOMNode(element).scrollIntoView({ block: 'end', behavior: 'smooth' });
  }

  render() {
    let { groupsData } = this.props.groupsDataReducer
    let { contextId } = this.props.contextIdReducer
    let groupId = this.props.groupIndex.id
    let groupData = this.groupData(groupsData, groupId)

    let active = false
    if (contextId !== null) {
      active = contextId.groupId == groupId
    }

    let style = active ? Style.menuItem.heading.current : Style.menuItem.heading.normal
    let expandedGlyph = <Glyphicon glyph="chevron-down" style={{ float: 'right', marginTop: '3px' }} />
    let collapsedGlyph = <Glyphicon glyph="chevron-right" style={{ float: 'right', marginTop: '3px' }} />
    let progress = this.generateProgress();
    return (
      <div>
        <div style={style} onClick={() => this.props.actions.changeCurrentContextId(groupData[0].contextId)} >
          {active ? expandedGlyph : collapsedGlyph}
          <Circle
            progress={progress}
            options={{ strokeWidth: 15, color: "var(--accent-color-light)", trailColor: "var(--reverse-color)", trailWidth: 15 }}
            initialAnimate={false}
            containerStyle={{ width: '20px', height: '20px', marginRight: '10px', float: 'left' }}
          />
          {this.props.groupIndex.name}
        </div>
        {active && groupData ? this.groupItems(groupData) : null}
      </div>
    );
  }

}

module.exports = Group;
