const React = require('react');
const CoreActions = require('../../../actions/CoreActions.js');
const Modal = require('react-bootstrap/lib/Modal.js');
const Button = require('react-bootstrap/lib/Button.js');
const ButtonToolbar = require('react-bootstrap/lib/ButtonToolbar.js');
const CoreStore = require('../../../stores/CoreStore.js');
const api = window.ModuleApi;
const booksOfBible = require('../BooksOfBible');
const Upload = require('../Upload');
const loadOnline = require('../LoadOnline');
const CoreActionsRedux = require('../../../actions/CoreActionsRedux.js');
const { connect  } = require('react-redux');

const ProjectModal = React.createClass({
  submitLink: function () {
    var link = this.refs.TargetLanguage.getLink();
    var _this = this;
    loadOnline(link, function(err, savePath, url) {
      if (!err) {
        Upload.sendFilePath(savePath, url);
      } else {
        console.error(err);
      }
    });
  },

  /**
 * @description - This keeps the currentCheckNamespace intact
 */
  onClick: function (e) {
    if (this.refs.TargetLanguage.state.active == 1) {
      this.submitLink();
    }
    if (this.refs.TargetLanguage.state.active == 3) {
      if (!this.refs.TargetLanguage.enterSaveLocation()) {
        return;
      }
    }
    api.emitEvent('changeCheckType', { currentCheckNamespace: null });
    api.emitEvent('newToolSelected', {'newToolSelected': true});
    this.close();
    api.Toast.info('Info:', 'Your project is ready to be loaded once you select a tool', 5);
    if (this.refs.TargetLanguage.state.active == 1){
      let loadedLink = this.refs.TargetLanguage.getLink();
      if(loadedLink != ""){
        CoreActions.updateCheckModal(true);
      }
    }
  },

  _handleKeyPress: function(e) {
    if (e.key === 'Enter') {
      this.onClick(e);
    }
  },

  render: function () {
    
    return (
      <div>
        <Modal show={this.props.showModal} onHide={this.props.close} onKeyPress={this._handleKeyPress}>
          <Upload.Component ref={"TargetLanguage"} pressedEnter={this.onClick}/>
          <Modal.Footer>
            <ButtonToolbar>
              <Button bsSize="xsmall" style={{ visibility: this.props.backButton }}>{'Back'}</Button>
              <Button type="button" onClick={this.onClick} style={{ position: 'fixed', right: 15, bottom: 10 }}>{this.props.doneText}</Button>
            </ButtonToolbar>
          </Modal.Footer>
        </Modal>
      </div>
    )
  }
});

function mapStateToProps(state) {
  //This will come in handy when we separate corestore and checkstore in two different reducers
  
  return Object.assign({}, state, state.loginModalReducer);
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    close:() => {
      dispatch(CoreActionsRedux.showCreateProject(false));
    }
  }
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(ProjectModal);
