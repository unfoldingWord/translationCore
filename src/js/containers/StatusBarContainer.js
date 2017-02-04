const React = require('react');
const { connect  } = require('react-redux');
const modalActions = require('../actions/ModalActions.js');
const StatusBar = require('../components/core/SideBar/StatusBar.js');

class StatusBarContainer extends React.Component {
    render() {
        return (
            <div>
            <StatusBar currentCheckNameSpace={this.props.currentCheckNameSpace} open={this.props.openModalAndSpecificTab}/>
            </div>
        )
    }
}

function mapDispatchToProps(dispatch, ownProps) {
    return {
        openModalAndSpecificTab: (tabkey, sectionKey, visible) => {
            dispatch(modalActions.selectModalTab(tabkey, sectionKey, visible));
        },
    }
}

function mapStateToProps(state) {
    return Object.assign({}, state.statusBarReducer, {
        currentCheckNameSpace:state.checkStoreReducer.currentCheckNameSpace
    });
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(StatusBarContainer);