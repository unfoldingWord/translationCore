import React from 'react';
import PropTypes from 'prop-types';
import { Glyphicon, Image, Panel, ListGroup, FormGroup, FormControl } from 'react-bootstrap';

class Profile extends React.Component {
  render() {
    let { userdata, onHandleLogout, goToProjectsTab } = this.props;
    const panelTitle = (
      <div style={{display: "flex", justifyContent: "space-between"}}>
        <h3 style={{marginTop: "10px"}}>Category:</h3>
        <FormControl onChange={this.props.subjectChange}
                     componentClass="select"
                     placeholder="Select Category"
                     style={{display: "flex", justifyContent: "flex-end", width: "200px", marginTop: "10px"}}>
          <option value="General Feedback">General Feedback</option>
          <option value="Content Feedback">Content & Resources Feedback</option>
          <option value="Bug Report">Bug Report</option>
        </FormControl>
      </div>
    );
    return (
    <div style={{display: "flex"}}>
        <div style={{backgroundColor: "var(--reverse-color)", overflowY: "auto", display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "center", flex: "1", padding: "1rem", height: "520px"}}>
          <div style={{display: "flex", flexDirection: "column", alignItems: "center" }}>
            <h3>Account Information</h3>
            <Image style={{height: '85px', margin: "30px 0" }}
                   src={userdata.avatar_url ? userdata.avatar_url : "images/user.png"} circle />
            <span><strong>Username: </strong>{userdata.username}</span>
            <small>This is publicly visible</small>
          </div>
          <div style={{display: "flex", justifyContent: "center" }}>
              <button
                className="btn-second"
                onClick={onHandleLogout}>
                Log Out
              </button>
          </div>
        </div>
        <div style={{backgroundColor: "var(--reverse-color)", display: "flex", flexDirection: "column", justifyContent: "space-between", flex: "2", padding: "1rem", height: "520px"}}>
          <div style={{alignItems: "center"}}>
          <h3>Feedback and Comments</h3><br />
          <Panel header={panelTitle} style={{padding: "0px", borderColor: "var(--border-color)"}}>
            <ListGroup fill>
            <FormGroup controlId="formControlsTextarea" style={{marginBottom: '0px'}}>
              <FormControl value={this.props.feedback}
                onChange={this.props.feedbackChange}
                componentClass="textarea"
                style={{height: "200px", color: "var(--text-color-dark)", padding: "20px", borderRadius: '0px'}}
                placeholder={this.props.placeholder === undefined ? "Leave us your feedback!" : this.props.placeholder} />
            </FormGroup>
            <button
              className={(this.props.feedback === null) || (this.props.feedback === "") ? "btn-prime-reverse" : "btn-prime"}
              style={{width: '100%', margin: "0"}}
              onClick={this.props.submitFeedback}>
              Submit
            </button>
            </ListGroup>
          </Panel>
          </div>
          <div style={{display: "flex", justifyContent: "flex-end"}}>
            <button
              className="btn-prime"
              onClick={goToProjectsTab}>
              Next&nbsp;&nbsp;
              <Glyphicon glyph="share-alt" />
            </button>
          </div>
        </div>
    </div>
    );
  }
}

Profile.propTypes = {
    userdata: PropTypes.any,
    onHandleLogout: PropTypes.func,
    goToProjectsTab: PropTypes.any,
    subjectChange: PropTypes.func.isRequired,
    feedback: PropTypes.any.isRequired,
    feedbackChange: PropTypes.func.isRequired,
    placeholder: PropTypes.any.isRequired,
    submitFeedback: PropTypes.func.isRequired
};

export default Profile;
