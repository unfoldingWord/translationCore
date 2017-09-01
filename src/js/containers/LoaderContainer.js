import React from 'react';
import { connect } from 'react-redux';
// Components
import Loader from '../components/loader/Loader';
//actions
import * as ProjectSelectionActions from '../actions/ProjectSelectionActions';
import * as LoaderActions from '../actions/LoaderActions';
import * as BodyUIActions from '../actions/BodyUIActions';

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
        dispatch(ProjectSelectionActions.clearLastProject())
        dispatch(LoaderActions.toggleLoader(false))
        dispatch(BodyUIActions.goToStep(2))
      }
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoaderContainer);
