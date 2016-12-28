const React = require('react');
const CoreStore = require('../../../stores/CoreStore.js');
const CoreActions = require('../../../actions/CoreActions.js');
const Button = require('react-bootstrap/lib/Button.js');
const Row = require('react-bootstrap/lib/Row.js');
const Col = require('react-bootstrap/lib/Col.js');
const Image = require('react-bootstrap/lib/Image.js');

const style = require('./loginStyle');
const Projects = require('../../../containers/Projects.js');

class Profile extends React.Component {
  constructor(){
    super();
    this.state = {projectVisibility: false}
  }
  handleLogout(){
    CoreActions.updateOnlineStatus(false);
    CoreActions.updateProfileVisibility(false);
    CoreActions.login(null);
    localStorage.removeItem('user');
  }

  showProjects(){
    this.setState({projectVisibility: true});
  }

  hideProjects(){
    this.setState({projectVisibility: false});
  }

  render(){
    let user = CoreStore.getLoggedInUser();
    let fullName = user.full_name;
    let userName = user.username;
    let profilePicture = user.avatar_url;
    let emailAccount = user.email;
    if (this.state.projectVisibility) {
      return(
        <Projects back={this.hideProjects.bind(this)} projects={this.state.projects}/>
      );
    } else {
      return(
        <div>
        <center>
        <Image style={{height: '100px', width:'100px', marginTop:"50px"}}
        src={profilePicture} circle />
        <span><h3>{fullName}</h3></span>
        <span><strong>User Name: </strong></span>
        <span className="label label-success">{userName}</span>
        <span><p>{emailAccount}</p></span>
        <Button bsStyle="primary" style={{width: "100%",marginTop:"50px"}} onClick={this.showProjects.bind(this)}>
        Your Door43 Projects
        </Button>
        <Button bsStyle="primary" style={{marginBottom:"50px", width: '100%', marginTop: '15px'}}
        onClick={this.handleLogout.bind(this)}>Logout</Button>
        </center>
        </div>
      );
    }
  }
}

module.exports = Profile;
