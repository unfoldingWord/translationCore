const React = require('react');
const CoreStore = require('../../stores/CoreStore.js');
const ProgressBar = require('react-bootstrap/lib/ProgressBar.js');
const Modal = require('react-bootstrap/lib/Modal.js');

class Loader extends React.Component {
  componentWillMount() {
    CoreStore.addChangeListener(this.props.update);
  }

  componentWillUnmount() {
    CoreStore.removeChangeListener(this.props.update);
  }

  render() {

    return (
      <div>
        <Modal show={this.props.showModal}>
          <ProgressBar striped active now={this.props.progress} style={{top:'50vh', left: '50vw'}}/>
          <center>
            <img src="images/TC_ANIMATED_Logo.gif"/>
            {this.props.reloadContent}
          </center>
        </Modal>
      </div>
    );
  }
}

module.exports = Loader;
