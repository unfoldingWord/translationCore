import React from 'react';
import { connect } from 'react-redux';
// Components
import Loader from '../components/core/loader/Loader';
// Actions
import * as LoaderActions from '../actions/LoaderActions.js';

class LoaderContainer extends React.Component {
  render() {
    return (
      <Loader {...this.props}/>
    );
  }
}

const mapStateToProps = state => {
  return {
    loaderReducer: state.loaderReducer,
    currentToolReducer: state.currentToolReducer
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    reloadContent: () => {
      dispatch(LoaderActions.killLoading());
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoaderContainer);
