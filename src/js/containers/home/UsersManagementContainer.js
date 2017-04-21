import React, { Component } from 'react'
import { connect } from 'react-redux'
// components
import Login from '../../components/home/Login'
// actions
// import {actionCreator} from 'actionCreatorPath'

const UserManagementContainer = () => {
  return (
    <Login {...this.props} />
  );
};

const mapStateToProps = (state, ownProps) => {
  return {
    prop: state.prop
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    dispatch1: () => {
      // dispatch(actionCreator);
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UserManagementContainer);
