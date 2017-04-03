import React from 'react'
import {Glyphicon} from 'react-bootstrap'
import ProgressBar from 'react-progressbar.js'
const {Circle} = ProgressBar
import GroupItem from './GroupItem'
import * as Style from './Style'

class Group extends React.Component {

/**
 * @description filters groupData from groupsData to the this groupId
 * @param {array} groupsData - array of all groupData objects
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
 * @description Maps all groupData aka check objects to GroupItem components
 * @param {array} groupsData - array of all groupData objects
 * @param {bool} active - whether or not the group is active/current
 * @return {array} groupItems - array of groupData mapped to GroupItem components
 */
  groupItems(groupData, active) {
    let groupItems = <div /> // leave empty while there is no data to populate
    if (active && groupData.constructor == Array) { // populate the data when it exists
      groupItems = groupData.map((groupItemData, index) =>
        <GroupItem {...this.props} {...groupItemData} key={index} />
      )
    }
    return groupItems
  }

  render() {
    let {groupsData} = this.props.groupsDataReducer
    let {contextId} = this.props.contextIdReducer
    let groupId = this.props.groupIndex.id
    let groupData = this.groupData(groupsData, groupId)

    let active = false
    if (contextId !== null) {
      active = contextId.groupId == groupId
    }

    let style = active ? Style.menuItem.heading.current : Style.menuItem.heading.normal

    let expandedGlyph = <Glyphicon glyph="chevron-down" style={{ float: 'right', marginTop: '3px' }} />
    let collapsedGlyph = <Glyphicon glyph="chevron-right" style={{ float: 'right', marginTop: '3px' }} />

    return (
      <div>
        <div style={style} onClick={() => this.props.actions.changeCurrentContextId(groupData[0].contextId)} >
          <Circle
            progress={0.5}
            options={{ strokeWidth: 15, color: "#4ABBE6", trailColor: "#FFF", trailWidth: 15 }}
            initialAnimate={false}
            containerStyle={{ width: '20px', height: '20px', marginRight: '5px', float: 'left' }}
          />
          {this.props.groupIndex.name}
          {active ? expandedGlyph : collapsedGlyph}
        </div>
        {this.groupItems(groupData, active)}
      </div>
    );
  }

}

module.exports = Group;
