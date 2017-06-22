import React, { Component } from 'react';
import { connect } from 'react-redux'
// components
import ToolsCards from '../../components/home/toolsManagement/ToolsCards'
// actions
// import {actionCreator} from 'actionCreatorPath'

class ToolsManagementContainer extends Component {

  componentWillMount() {
    let instructions = <div>ToolsManagementInstructions</div>;
    if (this.props.reducers.BodyUIReducer.homeInstructions !== instructions) {
      this.props.actions.changeHomeInstructions(instructions);
    }
  }

  render() {
    return (
      <div>
        ToolsManagementContainer
        <ToolsCards {...this.props}/>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    prop: state.prop
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    dispatch1: () => {
      // dispatch(actionCreator)
    }
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ToolsManagementContainer)
