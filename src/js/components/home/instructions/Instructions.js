import React, { Component } from 'react'

class Instructions extends Component {
  render() {
    let { homeInstructions } = this.props.BodyUIReducer;
    return (
      <div>
        Instructions
        {homeInstructions}
      </div>
    )
  }
}

export default Instructions
