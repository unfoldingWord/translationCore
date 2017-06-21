import React, { Component } from 'react'

class UserCard extends Component {
  render() {
    console.log(this.props)
    return (
      <div style={{ padding: '0 0 20px 0' }}>
        {this.props.heading}
        <div style={{ width: '100%', background: 'white', padding: '20px', marginTop: '10px' }}>
          {this.props.content}
        </div>
      </div>
    )
  }
}

export default UserCard
