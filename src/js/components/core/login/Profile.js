const React = require('react');
const CoreStore = require('../../../stores/CoreStore.js');
const CoreActions = require('../../../actions/CoreActions.js');
const { Button, Row, Col, Image, Panel, ListGroup, utils } = require('react-bootstrap/lib');
const bootstrapUtils = utils.bootstrapUtils;
bootstrapUtils.addStyle(Button, 'blue');
bootstrapUtils.addStyle(Button, 'small-blue');
const style = require('./loginStyle');


class Profile extends React.Component {
  render(){
    let { userdata, onHandleLogout } = this.props;
    const panelTitle = (<h3>Category: <span style={{float: "right"}}>Bug Report</span></h3>);
    return(
      <div>
        <style type="text/css">
          {`
            .btn-blue {
              background-color: #0277BD;
              color: white;
              height: 60px;
              border-radius: 0px;
              font-weight: bold;
            }
            .btn-blue:hover {
              background-color: #C6C4C4;
            }
            .btn-small-blue {
              width: 100%;
              background-color: #0277BD;
              color: white;
              border-radius: 0px;
              font-weight: bold;
              margin: 0px;
            }
            .btn-small-blue:hover {
              background-color: #C6C4C4;
            }
          `}
        </style>
      <Row style={{marginLeft: "0px", marginRight: "0px"}}>
        <Col sm={12} md={4} lg={4} style={{backgroundColor: "#434343", padingTop: "20px", padding: "0px", height: "520px"}}>
          <div style={{padding: "20px 10px 10px 10px"}}>
            <h3>Account Information</h3><br />
            <Image style={{height: '85px', width:'85px', margin:"auto", display: "flex"}}
                   src={userdata.avatar_url} circle /><br /><br />
            <span><strong>Username: </strong>{userdata.username}</span><br />
            <small style={{color: "#BFBFBF"}}>This is publicly visible</small><br /><br />
            <span><strong>Email: </strong>{userdata.email ? userdata.email : "No email address found"}</span><br />
            <small style={{color: "#BFBFBF"}}>This is visible to other users and may appear in the revision history of files you edit.</small><br /><br />
          </div><br /><br />
          <Button bsStyle="blue"
                  style={{marginBottom:"0px", width: '100%', marginTop: '5px', bottom: "0px", position: "absolute"}}
                  onClick={onHandleLogout}>
                Sign Out
          </Button>
        </Col>
        <Col sm={12} md={6} lg={8} style={{padding: "20px 25px 0px 25px", height: "520px"}}>
          <h3>Feedback and Comments</h3><br />
          <Panel header={panelTitle} style={{padding: "0px", borderColor: "#333333"}}>
            <ListGroup fill>
              {/* Here we'll have that text box to handle feedback*/}
            <p style={{height: "100px", color: "#000000", padding: "20px"}}>Leave us your feedback!</p>
            <Button bsStyle="small-blue">
              Submit
            </Button>
            </ListGroup>
          </Panel>
        </Col>
      </Row>
    </div>
    );
  }
}

module.exports = Profile;
