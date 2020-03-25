import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getTranslate } from '../selectors/';
// components
import Alert from '../components/dialogComponents/Alert';
// actions
import { closeAlertDialog } from '../actions/AlertModalActions';

class AlertDialogContainer extends Component {
  render(){
    const { translate } = this.props;
    return (
      <div>
        <Alert translate={translate} {...this.props}/>
      </div>
    );
  }
}

AlertDialogContainer.propTypes = { translate: PropTypes.func.isRequired };

const mapStateToProps = (state) => ({
  alertModalReducer: state.alertModalReducer,
  translate: getTranslate(state),
});

const mapDispatchToProps = (dispatch) => ({
  actions: {
    closeAlertDialog: () => {
      dispatch(closeAlertDialog());
    },
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(AlertDialogContainer);
