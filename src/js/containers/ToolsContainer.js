const React = require('react');
const { connect  } = require('react-redux');
const CheckStoreActions = require('../actions/CheckStoreActions.js');


class ToolsContainer extends React.Component {
    render() {
      let Tool = this.props.currentTool;
      return (
        <Tool {...this.props}/>
      );
    }
}

function mapStateToProps(state) {
    return Object.assign({}, state.checkStoreReducer);
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
      handleGoToCheck: (newGroupIndex, newCheckIndex) => {
          dispatch(CheckStoreActions.goToCheck(newGroupIndex, newCheckIndex));
      },
      handleGoToNext: () => {
          dispatch(CheckStoreActions.goToNext());
      },
      handleGoToPrevious: () => {
          dispatch(CheckStoreActions.goToPrevious());
      },
    }
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(ToolsContainer);
