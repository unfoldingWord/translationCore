import React, { Component } from 'react'

class BackNavigation extends Component {
  render() {
    let { goToNextStep, goToPrevStep} = this.props.actions

    return (
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around'}}>
        <button onClick={goToPrevStep}> Go back </button>
        <button onClick={goToNextStep}> Next </button>
      </div>
    )
  }
}

export default BackNavigation
