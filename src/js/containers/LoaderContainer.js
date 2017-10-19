import React from 'react';
import { connect } from 'react-redux';
// Components
import Loader from '../components/Loader';

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
    toolsReducer: state.toolsReducer
  };
};

export default connect(
  mapStateToProps,
  null
)(LoaderContainer);
