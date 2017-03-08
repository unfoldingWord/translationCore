import React from 'react'
import { connect } from 'react-redux'
import Popover from '../components/core/Popover.js'
import { closePopover, showPopover } from '../actions/PopoverActions.js'

class PopoverContainer extends React.Component {
  render(){
    return (
      <div>
        <Popover {...this.props}/>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return Object.assign({}, state.popoverReducer);
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onClosePopover: () => {
      dispatch(closePopover())
    }
  }
}

module.exports = connect(
  mapStateToProps,
  mapDispatchToProps
)(PopoverContainer)
