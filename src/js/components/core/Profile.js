const React = require('react');

const Button = require('react-bootstrap/lib/Button.js');
const Modal = require('react-bootstrap/lib/Modal.js');
const CoreStore = require('../../stores/CoreStore.js');
const CoreActions = require('../../actions/CoreActions.js');
const style = require('../../styles/loginStyle');


class Profile extends React.Component {
    close(){
      CoreActions.updateLoginModal(false);
    }

    render(){
      return(
        <div>
          <h1>  Hello </h1>
        </div>
    );
  }
}

module.exports = Profile;
