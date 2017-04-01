// SubMenu.js//
//api imports
import React from 'react'
import Group from './Group'
import { connect } from 'react-redux'

class Groups extends React.Component {
  render() {
    let groups = <div />
    if (this.props.groupsIndexReducer.groupsIndex !== undefined) {
      groups = this.props.groupsIndexReducer.groupsIndex.map(groupIndex =>
        <Group {...this.props} groupIndex={groupIndex} key={groupIndex.id} />
      )
    }
    return (
      <div style={{ color: "#FFF", width:"100%"}}>
        {groups}
      </div>
    )
  }
}

module.exports = Groups;
