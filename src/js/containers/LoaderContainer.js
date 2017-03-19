import React from 'react'
import { connect } from 'react-redux'
import LoaderActions from '../actions/LoaderActions.js'
import Loader from '../components/core/Loader';

class LoaderContainer extends React.Component {
    render() {
      return (
        <Loader {...this.props}/>
      );
    }
}

function mapStateToProps(state) {
    return Object.assign({}, state.loaderReducer);
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        reloadContent: () => {
            dispatch(LoaderActions.killLoading());
        },
        sendProgressForKey: (name, data) => {
            dispatch(LoaderActions.sendProgressForKey(name, data))
        }
    }
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(LoaderContainer);
