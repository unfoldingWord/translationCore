const React = require('react');
const CoreStore = require('../../../stores/CoreStore.js');
const CoreActions = require('../../../actions/CoreActions.js');
const Button = require('react-bootstrap/lib/Button.js');
const Row = require('react-bootstrap/lib/Row.js');
const Col = require('react-bootstrap/lib/Col.js');
const Image = require('react-bootstrap/lib/Image.js');
const style = require('./loginStyle');

class Profile extends React.Component {

  handleLogout(){
    CoreActions.updateOnlineStatus(false);
    CoreActions.updateProfileVisibility(false);
    CoreActions.login(null);
  }
  render(){
    let user = CoreStore.getLoggedInUser();
    let fullName = user.full_name;
    let userName = user.username;
    let profilePicture = user.avatar_url;
    let emailAccount = user.email;
    return(
        <div>
          <center>
            <Image style={{height: '100px', width:'100px', marginTop:"50px"}}
                   src={profilePicture} circle />
              <span><h3>{fullName}</h3></span>
              <span><strong>User Name: </strong></span>
              <span className="label label-success">{userName}</span>
              <span><p>{emailAccount}</p></span>
              <Button bsStyle="primary" style={{width: "100%",marginTop:"50px", marginBottom:"50px"}}
              onClick={this.handleLogout.bind(this)}>Logout</Button>
          </center>
        </div>
    );
  }
}

module.exports = Profile;
