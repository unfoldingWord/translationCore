import React, { Component } from 'react'

class BackNavigation extends Component {

  button(text, onclick) {
    let disabled = false;
    let className = 'btn-second'
    return (
      <button className={className} disabled={disabled} onClick={onclick}>
        {text}
      </button>
    )
  }

  render() {
    let { goToNextStep, goToPrevStep} = this.props.actions

    return (
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around'}}>
        {this.button('Go back', goToPrevStep)}
        {this.button('Next', goToNextStep)}
      </div>
    )
  }
}

export default BackNavigation
