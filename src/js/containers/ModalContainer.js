const React = require('react');
const Modal = require('react-bootstrap/lib/Modal.js');
const api = window.ModuleApi;
const CoreActionsRedux = require('../actions/CoreActionsRedux.js');
const { connect  } = require('react-redux');

class ModalContainer extends React.Component {
    render() {
        return (
            <div>
                <Modal bsSize="lg" show={this.props.visible} onHide={this.props.hide}>
                <div style={{backgroundColor: "#333333", color:'white'}}>
                HELLO
                </div>
                </Modal>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return Object.assign({}, state, state.newReducer);
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    hide: () => {
      dispatch(CoreActionsRedux.showModalContainer(false));
    }
  }
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(ModalContainer);
