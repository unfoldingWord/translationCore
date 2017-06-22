import React, { Component } from 'react'

class Instructions extends Component {
  render() {
    let { homeInstructions } = this.props.reducers.BodyUIReducer;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        Instructions
        <div style={{ width: '100%', height: '100%', background: 'white', padding: '20px', marginTop: '10px' }}>
          {homeInstructions}
        </div>
      </div>
    )
  }
}

export default Instructions
