import React, { Component } from 'react'
import { connect } from 'react-redux'
// components
import UserCard from '../../components/home/overview/UserCard'
import ProjectCard from '../../components/home/overview/ProjectCard'
import ToolCard from '../../components/home/overview/ToolCard'
// actions

class OverviewContainer extends Component {

  instructions() {
    return (
      <div>
        <p>Welcome to translationCore!<br/> To get started, please:</p>
        <ol>
          <li>Log in</li>
          <li>Select a Project</li>
          <li>Select a Tool</li>
          <li>Launch</li>
        </ol>
      </div>
    );
  }

  componentWillMount() {
    if (this.props.reducers.BodyUIReducer.homeInstructions !== this.instructions()) {
      this.props.actions.changeHomeInstructions(this.instructions());
    }
  }

  button() {
    return (
      <button className='btn-prime' disabled={true} onClick={() => {}}>
        Launch
      </button>
    )
  }

  render() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <UserCard {...this.props} />
        <ProjectCard {...this.props} />
        <ToolCard {...this.props} />
        <div style={{ textAlign: 'center' }}>
          {this.button()}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    // prop: state.prop
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    // dispatch: () => {
    //   // dispatch(actionCreator);
    // }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OverviewContainer);
