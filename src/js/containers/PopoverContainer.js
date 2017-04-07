import React from 'react'
import { connect } from 'react-redux'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import Popover from '../components/core/Popover.js'
import { closePopover } from '../actions/PopoverActions.js'

class PopoverContainer extends React.Component {
  render(){
    return (
      <div>
        <MuiThemeProvider>
          <Popover {...this.props}/>
        </MuiThemeProvider>
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PopoverContainer)
