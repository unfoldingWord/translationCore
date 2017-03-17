import React from 'react'
import { connect } from 'react-redux'
import AlertModalActions from '../actions/AlertModalActions.js'
const AlertModal = require('../components/core/AlertModal.js');


class AlertModalContainer extends React.Component {
    render() {
        var currentStyle;
        if (this.props.leftButtonText || this.props.rightButtonText) {
            currentStyle = {
                height: '30px',
                width: '60px',
                textAlign: 'center',
                verticalAlign: 'middle',
                padding: 0,
                left: '50%'
            }
        } else {
            currentStyle = {
                display: 'none'
            }
        }
        return (
            <AlertModal {...this.props} currentStyle={currentStyle} />
        );
    }
}

function mapStateToProps(state) {
    return Object.assign({}, state.alertModalReducer);
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        alertDismiss: (response, callback) => {
            dispatch(AlertModalActions.alertDismiss(response, callback))
        },
        toggleMoreInfo: () => {
            dispatch(AlertModalActions.toggleMoreInfo());
        },
    }
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(AlertModalContainer);
