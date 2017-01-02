const React = require('react');
const CoreStore = require('../../../stores/CoreStore.js');
const CoreActions = require('../../../actions/CoreActions.js');
const Button = require('react-bootstrap/lib/Button.js');
const Row = require('react-bootstrap/lib/Row.js');
const Col = require('react-bootstrap/lib/Col.js');
const Image = require('react-bootstrap/lib/Image.js');

const style = require('./loginStyle');
const Projects = require('./Projects.js');

class Profile extends React.Component {
  constructor(){
    super()
  }

  render(){
    if (this.props.projectVisibility) {
      return(
        <Projects back={this.props.hideProjects} {...this.props.profileProjectsProps}/>
      );
    } else {
      return(
        <div>
        <center>
        <Image style={{height: '100px', width:'100px', marginTop:"50px"}}
        src={this.props.profilePicture} circle />
        <span><h3>{this.props.fullName}</h3></span>
        <span><strong>User Name: </strong></span>
        <span className="label label-success">{this.props.userName}</span>
        <span><p>{this.props.emailAccount}</p></span>
        <Button bsStyle="primary" style={{width: "100%",marginTop:"50px"}} onClick={this.props.showProjects}>
        Your Door43 Projects
        </Button>
        <Button bsStyle="primary" style={{marginBottom:"50px", width: '100%', marginTop: '15px'}}
        onClick={this.props.handleLogout}>Logout</Button>
        </center>
        </div>
      );
    }
  }
}

module.exports = Profile;
