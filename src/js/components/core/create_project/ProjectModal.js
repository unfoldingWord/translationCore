const React = require('react');
const Modal = require('react-bootstrap/lib/Modal.js');
const Button = require('react-bootstrap/lib/Button.js');
const ButtonToolbar = require('react-bootstrap/lib/ButtonToolbar.js');
const Upload = require('../Upload.js');
const UploadMethods = require('../UploadMethods.js');
const OnlineInput = require('../OnlineInput');
const CoreStore = require('../../../stores/CoreStore.js');
const api = window.ModuleApi;
const loadOnline = require('../LoadOnline');
const CoreActionsRedux = require('../../../actions/CoreActionsRedux.js');
const { connect  } = require('react-redux');
const DragDrop = require('../DragDrop');
const ProjectViewer = require('../login/Projects.js');
const ImportUsfm = require('../Usfm/ImportUSFM');

class ProjectModal extends React.Component {
  constructor() {
    super();
  }

  componentWillMount() {
    CoreStore.addChangeListener(this.props.showCreateProject);      // action to show create project modal
  }

  componentWillUnmount() {
    CoreStore.removeChangeListener(this.props.showCreateProject);
  }

  render() {
    var mainContent;
    switch (this.props.show) {
      case 'file':
        mainContent = <DragDrop {...this.props.dragDropProps} />;
        break;
      case 'link':
        mainContent = (
          <div>
            <br />
            <OnlineInput onChange={this.props.handleOnlineChange} />
          </div>
        );
        break;
      case 'usfm':
        mainContent = (
          <div>
            <ImportUsfm.component {...this.props.importUsfmProps} />
          </div>
        );
        break;
      case 'd43':
        mainContent = (
          <div>
            <ProjectViewer {...this.props.profileProjectsProps} />
          </div>
        )
        break;
      default:
        mainContent = (<div> </div>)
        break;
    }
    return (
      <div>
        <Modal show={this.props.showModal} onHide={this.props.close} onKeyPress={this.props._handleKeyPress}>
          <Upload {...this.props.uploadProps}>
            {mainContent}
          </Upload>
          <Modal.Footer>
            <ButtonToolbar>
              <Button type="button" onClick={this.props.onClick} style={{ position: 'fixed', right: 15, bottom: 10 }}>{this.props.doneText}</Button>
            </ButtonToolbar>
          </Modal.Footer>
        </Modal>
      </div>
    )
  }
}

function mapStateToProps(state) {
  //This will come in handy when we separate corestore and checkstore in two different reducers
  return Object.assign({}, state, state.projectModalReducer);
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    close: () => {
      dispatch(CoreActionsRedux.showCreateProject(false));
    }
  }
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(ProjectModal);
