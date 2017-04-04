const React = require('react');
const { connect  } = require('react-redux');
const modalActions = require('../actions/ModalActions.js');
const coreStoreActions = require('../actions/CoreActionsRedux.js');
const StatusBar = require('../components/core/SideBar/StatusBar.js');

class StatusBarContainer extends React.Component {
    render() {
        return (
            <div>
            <StatusBar bookName={this.props.bookName} currentCheckNamespace={this.props.currentCheckNamespace} open={this.props.openModalAndSpecificTab} online={this.props.online} changeOnlineStatus={this.props.changeOnlineStatus}/>
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
    return Object.assign({}, state.statusBarReducer);
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(StatusBarContainer);
