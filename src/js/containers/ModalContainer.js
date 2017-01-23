const React = require('react');
const Modal = require('react-bootstrap/lib/Modal.js');
const api = window.ModuleApi;
const modalActions = require('../actions/ModalActions.js');
const { connect  } = require('react-redux');
const Application = require('./ApplicationModalContainer');
const Load = require('./LoadModalContainer');
const Tools = require('./ToolsModalContainer');

class ModalContainer extends React.Component {
    render() {
        var currentTab;
        switch (this.props.currentTab) {
            case "application":
                currentTab = <Application {...this.props.application}/>;
                break;
            case "load":
                currentTab = <Load {...this.props.load}/>;
                break;
            case "tools":
                currentTab = <Tools {...this.props.tools}/>;
                break;
            default:
                currentTab = <Application {...this.props.application}/>;
                break;
        }
        return (
            <div>
                <Modal bsSize="lg" show={this.props.visible} onHide={this.props.hide}>
                    <div style={{ backgroundColor: "#333333", color: 'white' }}>
                        {currentTab}
                    </div>
                </Modal>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return Object.assign({}, state, state.newModalReducer);
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        hide: () => {
            dispatch(modalActions.showModalContainer(false));
        }
    }
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(ModalContainer);
