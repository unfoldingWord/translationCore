import React, { Component } from 'react'
import { connect } from 'react-redux'
// components
import Login from '../../components/home/usersManagement/Login'
// actions
// import {actionCreator} from 'actionCreatorPath'

class UsersManagementContainer extends Component {

  componentWillMount() {
    let instructions = <div>UsersManagementInstructions</div>;
    if (this.props.reducers.BodyUIReducer.homeInstructions !== instructions) {
      this.props.actions.changeHomeInstructions(instructions);
    }
  }

  render() {
    return (
      <div>
        UsersManagementContainer
        <Login {...this.props} />
      </div>
    );
  }
};

const mapStateToProps = (state, ownProps) => {
  return {
    // props: ''
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
)(UsersManagementContainer);
