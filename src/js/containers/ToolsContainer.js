const React = require('react');
const { connect  } = require('react-redux');
const CheckStoreActions = require('../actions/CheckStoreActions.js');
import { showNotification } from '../actions/NotificationActions.js'


class ToolsContainer extends React.Component {
    render() {
      let Tool = this.props.currentTool;
      return (
        <Tool {...this.props}/>
      );
    }
}

function mapStateToProps(state) {
    return Object.assign({}, state.checkStoreReducer, state.loginReducer, state.settingsReducer, state.statusBarReducer);
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
      updateCurrentCheck: (NAMESPACE, newCurrentCheck) => {
        dispatch(CheckStoreActions.updateCurrentCheck(NAMESPACE, newCurrentCheck));
      },
      handleGoToCheck: (newGroupIndex, newCheckIndex) => {
        dispatch(CheckStoreActions.goToCheck(newGroupIndex, newCheckIndex));
      },
      handleGoToNext: (NAMESPACE) => {
        dispatch(CheckStoreActions.goToNext(NAMESPACE));
      },
      handleGoToPrevious: (NAMESPACE) => {
        dispatch(CheckStoreActions.goToPrevious(NAMESPACE));
      },
      showNotification: (message, duration) => {
        dispatch(showNotification(message, duration));
      }
    }
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(ToolsContainer);
