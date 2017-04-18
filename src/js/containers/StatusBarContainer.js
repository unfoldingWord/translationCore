const React = require('react');
const { connect  } = require('react-redux');
const modalActions = require('../actions/ModalActions.js');
const coreStoreActions = require('../actions/CoreActionsRedux.js');
const StatusBar = require('../components/core/SideBar/StatusBar.js');

class StatusBarContainer extends React.Component {
    render() {
      let { bookName } = this.props.projectDetailsReducer;
      let { toolName } = this.props.currentToolReducer;
      let { username } = this.props.loginReducer.userdata;
        return (
            <div>
            <StatusBar bookName={bookName}
                       currentCheckNamespace={toolName}
                       open={this.props.openModalAndSpecificTab}
                       online={this.props.online}
                       changeOnlineStatus={this.props.changeOnlineStatus}
                       currentUser={username}/>
            </div>
        )
    }
}

function mapDispatchToProps(dispatch, ownProps) {
    return {
        openModalAndSpecificTab: (tabkey, sectionKey, visible) => {
            dispatch(modalActions.selectModalTab(tabkey, sectionKey, visible));
        },
        changeOnlineStatus: (val) => {
            dispatch(coreStoreActions.changeOnlineStatus(val));
        },
    }
}

function mapStateToProps(state) {
    return {
       statusBarReducer: state.statusBarReducer,
       currentToolReducer: state.currentToolReducer,
       projectDetailsReducer: state.projectDetailsReducer,
       loginReducer: state.loginReducer
    }
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(StatusBarContainer);
