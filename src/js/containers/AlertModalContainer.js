import React from 'react'
import { connect } from 'react-redux'
import LoaderActions from '../actions/LoaderActions.js'
const AlertModal = require('../components/core/AlertModal.js');

class AlertModalContainer extends React.Component {
    render() {
      return (
        <AlertModal {...this.props}/>
      );
    }
}

function mapStateToProps(state) {
    return Object.assign({}, state.loaderReducer);
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {

    }
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(AlertModalContainer);
