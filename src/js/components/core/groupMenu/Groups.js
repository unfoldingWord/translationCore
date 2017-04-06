import React from 'react'
import Group from './Group'
import { connect } from 'react-redux'

class Groups extends React.Component {
/**
 * @description converts groupsIndex into array of Group components
 * @param {array} groupsIndex - array of all groupIndex objects
 * @return {array} groups - array of Group components
 */
  groups(groupsIndex) {
    let groups = <div /> // leave an empty container when required data isn't available
    let {groupsData} = this.props.groupsDataReducer
    if (groupsIndex !== undefined) {
      groups = groupsIndex.filter( groupIndex => {
        return groupsData !== undefined && Object.keys(groupsData).includes(groupIndex.id)
      })
      //Alphabetize the groups order
      groups = groups.sort( (a, b) => {
        if(a.id.toUpperCase() < b.id.toUpperCase()){
          return -1;
        }
        if(a.id.toUpperCase() > b.id.toUpperCase()){
          return 1;
        }
        return 0;
      })
      groups = groups.map( groupIndex =>
        <Group {...this.props} groupIndex={groupIndex} key={groupIndex.id} />
      )
    }
    return groups
  }

  render() {
    let {groupsIndex} = this.props.groupsIndexReducer

    return (
      <div style={{color: "#FFF", width:"100%"}}>
        {this.groups(groupsIndex)}
      </div>
    )
  }
}

module.exports = Groups;
