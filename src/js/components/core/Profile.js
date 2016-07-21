const React = require('react');
const CoreStore = require('../../stores/CoreStore.js');
const CoreActions = require('../../actions/CoreActions.js');

const Button = require('react-bootstrap/lib/Button.js');
const Row = require('react-bootstrap/lib/Row.js');
const Col = require('react-bootstrap/lib/Col.js');
const Image = require('react-bootstrap/lib/Image.js');
const style = require('../../styles/loginStyle');


class Profile extends React.Component {

    render(){
      let user = CoreStore.getLoggedInUser();
      let fullName = user.full_name;
      let userName = user.username;
      let profilePicture = user.avatar_url;
      let emailAccount = user.email;
      return(
        <div>
          <Row>
            <Col xs={4} md={2}>
              <Image style={{height: '100px', width:'100px'}} src={profilePicture} circle />
              <h1> {fullName} </h1>
              <h2> {userName} </h2>
              <h3> {emailAccount} </h3>
            </Col>
          </Row>
        </div>
    );
  }
}

module.exports = Profile;
