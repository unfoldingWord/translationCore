import React, { Component } from 'react'
import { connect } from 'react-redux'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import Snackbar from '../components/core/notifications/Snackbar.js'
import { hideNotification } from '../actions/NotificationActions.js'

class NotificationContainer extends Component {
  render(){
    return (
      <div>
        <MuiThemeProvider>
          <Snackbar {...this.props}/>
        </MuiThemeProvider>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return Object.assign({}, state.notificationsReducer);
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    hideNotification: () => {
      dispatch(hideNotification())
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NotificationContainer)
