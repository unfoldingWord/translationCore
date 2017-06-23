import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types';
// components
import UserCard from '../../components/home/overview/UserCard'
import ProjectCard from '../../components/home/overview/ProjectCard'
import ToolCard from '../../components/home/overview/ToolCard'
// actions
// import {actionCreator} from 'actionCreatorPath'

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

  button(disabled, callback) {
    return (
      <button className='btn-prime' disabled={disabled} onClick={callback}>
        Launch
      </button>
    )
  }

  render() {
    let { toolTitle } = this.props.reducers.currentToolReducer;
    let launchButtonDisabled = !toolTitle;
    let _this = this;
    let launchButtonCallback = () => {
      _this.props.actions.toggleHomeView();
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <UserCard {...this.props} />
        <ProjectCard {...this.props} />
        <ToolCard {...this.props} />
        <div style={{ textAlign: 'center' }}>
          {this.button(launchButtonDisabled, launchButtonCallback)}
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

OverviewContainer.propTypes = {
  reducers: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OverviewContainer);
