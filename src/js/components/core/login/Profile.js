import React from 'react';
import { Button, Row, Col, Image, Panel, ListGroup, FormGroup, FormControl } from 'react-bootstrap';

class Profile extends React.Component {
  render(){
    let { userdata, onHandleLogout } = this.props;
    const panelTitle = (
      <div style={{display:"flex"}}>
        <h3>Category:</h3>
        <FormControl onChange={this.props.subjectChange}
                     componentClass="select"
                     placeholder="Select Category"
                     style={{
                       marginTop: "16px",
                       marginLeft: "130px",
                       width: "240px"
                     }}>
          <option value="General Feedback">General Feedback</option>
          <option value="Content Feedback">Content & Resources Feedback</option>
          <option value="Bug Report">Bug Report</option>
        </FormControl>
      </div>
    );
    return(
    <div>
      <Row style={{marginLeft: "0px", marginRight: "0px"}}>
        <Col sm={12} md={4} lg={4} style={{backgroundColor: "var(--reverse-color)", paddingTop: "20px", height: "520px", display: "flex", flexDirection: "column", justifyContent: "space-between", borderRight: "1px solid var(--border-color)"}}>
          <div style={{display: "flex", flexDirection: "column", alignItems: "center" }}>
            <h3>Account Information</h3>
            <Image style={{height: '85px', margin: "30px 0" }}
                   src="images/TC_Icon.png" circle />
            <span><strong>Username: </strong>{userdata.username}</span>
            <small>This is publicly visible</small>
          </div>
          <div style={{display: "flex", justifyContent: "center" }}>
              <Button bsStyle="prime"
                      onClick={onHandleLogout}>
                  Sign Out
              </Button>
          </div>
        </Col>
        <Col sm={12} md={6} lg={8} style={{padding: "20px 25px 0px 25px", height: "520px"}}>
          <h3>Feedback and Comments</h3><br />
          <Panel header={panelTitle} style={{padding: "0px", borderColor: "var(--border-color)"}}>
            <ListGroup fill>
            <FormGroup controlId="formControlsTextarea" style={{marginBottom: '0px'}}>
              <FormControl value={this.props.feedback} onChange={this.props.feedbackChange} componentClass="textarea" style={{height: "250px", color: "var(--text-color-dark)", padding: "20px", borderRadius: '0px'}} placeholder="Leave us your feedback!" />
            </FormGroup>
            <Button onClick={this.props.submitFeedback} bsStyle="prime" style={{width: '100%', margin: "0"}}>
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

export default Profile;
