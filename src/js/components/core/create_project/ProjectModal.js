const React = require('react');
const Modal = require('react-bootstrap/lib/Modal.js');
const Button = require('react-bootstrap/lib/Button.js');
const ButtonToolbar = require('react-bootstrap/lib/ButtonToolbar.js');
const loadOnline = require('../LoadOnline');
const Upload = require('../Upload.js');
const UploadMethods = require('../UploadMethods.js');
const OnlineInput = require('../OnlineInput');
const DragDrop = require('../DragDrop');
const ImportUsfm = require('../Usfm/ImportUSFM');

class ProjectModal extends React.Component {
  constructor() {
    super();
  }

  render() {
    return (
      <div>
        <Modal show={this.props.showModal} onHide={this.props.close} onKeyPress={this.props._handleKeyPress}>
          <Upload changeActive={this.props.changeActive} show={this.props.show} active={this.props.active}>
            {this.props.getMainContent.bind(this.props.show)}
          </Upload>
          <Modal.Footer>
            <ButtonToolbar>
              <Button type="button" onClick={this.props.onClick} style={{ position: 'fixed', right: 15, bottom: 10 }}>{'Load'}</Button>
            </ButtonToolbar>
          </Modal.Footer>
        </Modal>
      </div>
    )
  }
}

module.exports = ProjectModal;
