const React = require('react');
const CoreStore = require('../../../stores/CoreStore.js');
const CoreActions = require('../../../actions/CoreActions.js');
const Button = require('react-bootstrap/lib/Button.js');
const Row = require('react-bootstrap/lib/Row.js');
const Col = require('react-bootstrap/lib/Col.js');
const Image = require('react-bootstrap/lib/Image.js');
const style = require('./loginStyle');

class Profile extends React.Component {

  handleLogout() {
    CoreActions.updateOnlineStatus(false);
    CoreActions.updateProfileVisibility(false);
    CoreActions.login(null);
  }
  render() {
    let user = CoreStore.getLoggedInUser();
    let fullName = user.full_name;
    let userName = user.username;
    let profilePicture = user.avatar_url;
    let emailAccount = user.email;
    return React.createElement(
      'div',
      null,
      React.createElement(
        'center',
        null,
        React.createElement(Image, { style: { height: '100px', width: '100px', marginTop: "50px" },
          src: profilePicture, circle: true }),
        React.createElement(
          'span',
          null,
          React.createElement(
            'h3',
            null,
            fullName
          )
        ),
        React.createElement(
          'span',
          null,
          React.createElement(
            'strong',
            null,
            'User Name: '
          )
        ),
        React.createElement(
          'span',
          { className: 'label label-success' },
          userName
        ),
        React.createElement(
          'span',
          null,
          React.createElement(
            'p',
            null,
            emailAccount
          )
        ),
        React.createElement(
          Button,
          { bsStyle: 'primary', style: { width: "100%", marginTop: "50px", marginBottom: "50px" },
            onClick: this.handleLogout.bind(this) },
          'Logout'
        )
      )
    );
  }
}

module.exports = Profile;