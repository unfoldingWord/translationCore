import React, { Component } from 'react'
import { connect } from 'react-redux'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
// components
import Alert from '../components/dialogComponents/Alert'
// actions
import { closeAlertDialog } from '../actions/AlertModalActions'

class AlertDialogContainer extends Component {

  render(){
    return (
      <div>
        <MuiThemeProvider>
          <Alert {...this.props}/>
        </MuiThemeProvider>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    alertModalReducer: state.alertModalReducer
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    actions: {
      closeAlertDialog: () => {
        dispatch(closeAlertDialog())
      }
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AlertDialogContainer)
