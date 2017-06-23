import React, { Component } from 'react'
import { connect } from 'react-redux'
import Login from '../../components/home/usersManagement/Login';
import * as PopoverActions from '../../actions/PopoverActions';
import * as LoginActions from '../../actions/LoginActions';
import * as AlertModalActions from '../../actions/AlertModalActions';

class UsersManagementContainer extends Component {
  instructions() {
    return (
      <div>
        <div style={{ margin: 15 }}>Please login with you Door43 Account</div>
        <div style={{ margin: 15 }}>If you do not have an account already, you may create an account.</div>
        <div style={{ margin: 15 }}>If you would rather work offline, you may select continue offline.</div>
      </div>
    )
  }
  handleLoginSubmit(){
    this.props.loginUser();
    dispatch(this.props.goToNextStep());
  }

  componentWillMount() {
    let instructions = this.instructions();
    if (this.props.reducers.BodyUIReducer.homeInstructions !== instructions) {
      this.props.actions.changeHomeInstructions(instructions);
    }
  }

  render() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
        User
        <Login {...this.props} />
      </div>
    );
  }
};

const mapStateToProps = (state, ownProps) => {
  return {
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    loginUser: (userDataSumbit) => {
      dispatch(LoginActions.loginUser(userDataSumbit));
    },
    showPopover: (title, bodyText, positionCoord) => {
      dispatch(PopoverActions.showPopover(title, bodyText, positionCoord));
    },
    logoutUser: () => {
      dispatch(LoginActions.logoutUser());
    },
    showAlert:(message) => {
      dispatch(AlertModalActions.openAlertDialog(message))
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UsersManagementContainer);
