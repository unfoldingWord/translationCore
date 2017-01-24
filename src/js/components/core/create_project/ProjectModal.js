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
const RecentProjects = require('../RecentProjects.js').Component;

class ProjectModal extends React.Component {
  render() {
    var mainContent;
    switch (this.props.show) {
      case 'file':
        mainContent = <DragDrop {...this.props.dragDropProps} />;
        break;
      case 'link':
        mainContent = (
          <div style={{margin: '10% 0'}}>
          <center>
            <Button onClick={this.props.showD43} style={{width: '60%', fontWeight: 'bold', fontSize: '20px'}} bsStyle='primary' bsSize='large'>
              <img src="images/D43.svg" width="90" style={{marginRight: '25px', padding: '10px'}}/>
              Browse Door43 Projects
            </Button>
            <div style={{width: '60%', height: '20px', borderBottom: '2px solid white', textAlign: 'center', margin: '20px 0'}}>
              <span style={{fontSize: '20px', backgroundColor: '#333', fontWeight: 'bold', padding: '0 40px'}}>
                or
              </span>
            </div>
            <OnlineInput onChange={this.props.handleOnlineChange} load={()=> {this.props.onClick(this.props.show)}}/>
          </center>
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
      case 'recent':
        mainContent = (
          <div style={{padding: '15px'}}>
            <RecentProjects {...this.props.recentProjectsProps} />
          </div>
        )
        break;
      default:
        mainContent = (<div> </div>)
        break;
    }
    return (
      <div>
        <Modal bsSize="lg" show={this.props.showModal} onHide={this.props.close}
               onKeyPress={(e)=>this.props._handleKeyPress(e, this.props.show)}
               style={{padding: "20px", backgroundColor: "#333333"}}>
          <Upload {...this.props.uploadProps}>
            {mainContent}
          </Upload>
          <Modal.Footer style={{padding: "25px", backgroundColor: "#333333"}}>
            <ButtonToolbar>
              <Button bsStyle="danger" type="button" onClick={()=>this.props.onClick(this.props.show)} style={{ position: 'fixed', right: 15, bottom: 10 }}>{this.props.doneText}</Button>
            </ButtonToolbar>
          </Modal.Footer>
        </Modal>
      </div>
    )
  }
}

function mapStateToProps(state) {
  //This will come in handy when we separate corestore and checkstore in two different reducers
  return Object.assign({}, state, state.modalReducers.project);
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    close: () => {
      dispatch(CoreActionsRedux.showCreateProject(false));
    }
  }
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(ProjectModal);
