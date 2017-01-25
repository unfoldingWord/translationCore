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
  render(){
    let { userdata } = this.props;
    console.log(this.props);
    return(
      <div>
        <center>
          <Image style={{height: '100px', width:'100px', marginTop:"50px"}}
                 src={userdata.avatar_url} circle />
          <h3>{userdata.full_name}</h3>
          <strong>User Name: </strong>
          <span className="label label-success">{userdata.username}</span>
          <span><p>{userdata.email}</p></span>
          <Button bsStyle="primary" style={{marginBottom:"50px", width: '100%', marginTop: '15px'}}
                  onClick={this.props.onHandleLogout}>Logout</Button>
        </center>
      </div>
    );
  }
}

module.exports = Profile;
