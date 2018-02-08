import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslate } from '../components/Locale';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
// components
import Alert from '../components/dialogComponents/Alert';
// actions
import { closeAlertDialog } from '../actions/AlertModalActions';

class AlertDialogContainer extends Component {

  render(){
    const {translate} = this.props;
    return (
      <div>
        <MuiThemeProvider>
          <Alert translate={translate}
                 {...this.props}/>
        </MuiThemeProvider>
      </div>
    );
  }
}

AlertDialogContainer.propTypes = {
  translate: PropTypes.func.isRequired
};

const mapStateToProps = (state) => {
  return {
    alertModalReducer: state.alertModalReducer,
    translate: withTranslate(state)
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    actions: {
      closeAlertDialog: () => {
        dispatch(closeAlertDialog());
      }
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AlertDialogContainer);
