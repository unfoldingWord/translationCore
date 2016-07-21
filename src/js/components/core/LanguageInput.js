const React = require('react');

const remote = window.electron.remote;
const {dialog} = remote;

const FormGroup = require('react-bootstrap/lib/FormGroup.js');
const FormControl = require('react-bootstrap/lib/FormControl.js');
const Button = require('react-bootstrap/lib/Button.js');
const Modal = require('react-bootstrap/lib/Modal.js');

const TARGET_LANGUAGE_URL = "Translation Studio Project URL";
const ONLINE_BUTTON = 'Use Online Source';
const UPLOAD_BUTTON = 'Use Local Source';

const LanguageInput = React.createClass({
  getInitialState: function() {
    return {
      gatewayLanguage: '',
      targetLanguage: '',
      local: true,
      UPLOAD_GATEWAY: 'Choose Gateway Language Folder',
      UPLOAD_TARGET: 'Choose Translation Studio Project'
    };
  },
  handleGateway: function(e) {
    this.setState({gatewayLanguage: e.target.value});
  },
  handleTarget: function(e) {
    this.setState({targetLanguage: e.target.value});
  },
  changeLocal: function(boolean) {
    this.setState({local: boolean});
  },
  saveGateway: function() {
    var _this = this;
    dialog.showOpenDialog({
      properties: ['openDirectory']
    }, function(filename) {
      if (filename !== undefined) {
        _this.setState({gatewayLanguage: filename[0], UPLOAD_GATEWAY: filename[0]});
      }
    });
  },
  saveTarget: function() {
    var _this = this;
    dialog.showOpenDialog({
      properties: ['openDirectory']
    }, function(filename) {
      if (filename !== undefined) {
        _this.setState({targetLanguage: filename[0], UPLOAD_TARGET: filename[0]});
      }
    });
  },
  render: function() {
    var _this = this;
    var content;
    if (this.state.local === true) {
      content = (
        <div>
          <Button block onClick={this.saveGateway}>
            {this.state.UPLOAD_GATEWAY}
          </Button>
          <Button block onClick={this.saveTarget}>
            {this.state.UPLOAD_TARGET}
          </Button>
          <br />
        <Button onClick={(function() {_this.changeLocal(false)})}>
          {ONLINE_BUTTON}
        </Button>
        </div>
      );
    } else {
      content = (
        <div>
          <FormGroup controlId="gatewayLanguage">
            <FormControl type="text" placeholder={GATEWAY_LANGUAGE_URL} onChange={this.handleGateway}/>
          </FormGroup>
          <FormGroup controlId="targetLanguage">
            <FormControl type="password" placeholder={TARGET_LANGUAGE_URL} onChange={this.handleTarget}/>
          </FormGroup>
          <Button onClick={(function() {_this.changeLocal(true)})}>
            {UPLOAD_BUTTON}
          </Button>
        </div>
      );
    }

    return (
      <div>
        <Modal.Header>
          <Modal.Title>{this.props.modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {content}
        </Modal.Body>
      </div>
    );
  }
});

module.exports = LanguageInput;
