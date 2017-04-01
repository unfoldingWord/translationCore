// MenuItem.js//
//api imports
import React from 'react'
import {Glyphicon} from 'react-bootstrap'
import ProgressBar from 'react-progressbar.js'
const {Circle} = ProgressBar
import GroupItem from './GroupItem'
import * as Style from './Style'

class Group extends React.Component {
  render() {
    let active = this.props.contextIdReducer.contextId.groupId == this.props.groupIndex.id
    let style = active ? Style.menuItem.heading.current : Style.menuItem.heading.normal
    let {groupsData} = this.props.groupsDataReducer
    // leave empty while there is no data to populate
    let groupData
    let groupItems = <div></div>
    // populate the data when it exists
    if (groupsData !== undefined) {
      groupData = groupsData[this.props.groupIndex.id]
      if (active && groupData !== undefined) {
        groupItems = groupData.map((groupItemData, index) =>
          <GroupItem {...this.props} {...groupItemData} key={index} />
        )
      }
    }
    let total = groupItems.length

    let expandedGlyph = <Glyphicon glyph="chevron-down" style={{ float: 'right', marginTop: '3px' }} />
    let collapsedGlyph = <Glyphicon glyph="chevron-right" style={{ float: 'right', marginTop: '3px' }} />

    return (
      <div>
        <div style={style} onClick={() => this.props.actions.changeCurrentContextId(groupData[0].contextId)} >
          <Circle
            progress={0.5}
            options={{
              strokeWidth: 15,
              color: "#4ABBE6",
              trailColor: "#FFF",
              trailWidth: 15
            }}
            initialAnimate={false}
            containerStyle={{
              width: '20px',
              height: '20px',
              marginRight: '5px',
              float: 'left'
            }}
          />
          {this.props.groupIndex.name}
          {active ? expandedGlyph : collapsedGlyph}
        </div>
        {groupItems}
      </div>
    );
  }

}

module.exports = Group;
