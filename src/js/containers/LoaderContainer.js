import React from 'react';
import { connect } from 'react-redux';
// Components
import Loader from '../components/loader/Loader';
//actions
import * as ProjectLoadingActions from '../actions/ProjectLoadingActions';

class LoaderContainer extends React.Component {
  render() {
    return (
      <Loader {...this.props} />
    );
  }
}

const mapStateToProps = state => {
  return {
    loaderReducer: state.loaderReducer,
    toolsReducer: state.toolsReducer
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    actions: {
      cancelLoadingProject: () => {
        dispatch(ProjectLoadingActions.cancelLoadingProject())
      }
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoaderContainer);
