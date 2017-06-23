import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Glyphicon } from 'react-bootstrap';
import TemplateCard from './TemplateCard';

class UserCard extends Component {

  heading(callback) {
    let link = this.content() ? <a onClick={callback}>Log out</a> : <a></a>
    return (
      <span>Current User {link}</span>
    );
  }

  content() {
    let content;
    let { loggedInUser, userdata } = this.props.reducers.loginReducer;
    if (loggedInUser) {
      content = (
        <div style={{ display: 'flex' }}>
          <div style={{ width: '100px', height: '110px', color: 'lightgray', margin: '-16px 20px 0 -16px', overflow: 'hidden'}}>
            <Glyphicon glyph="user" style={{fontSize: "142px", marginLeft: '-23px'}} />
          </div>
          <div style={{ marginTop: '-10px' }}>
            <strong style={{ fontSize: 'x-large' }}>{userdata.username}</strong>
            <p>{userdata.email ? userdata.email : 'no email address'}</p>
          </div>
        </div>
      );
    }
    return content;
  }

  render() {
    let emptyMessage = 'Please log in to continue';
    let emptyButtonLabel = 'Login';
    let emptyButtonOnClick = () => { this.props.actions.goToNextStep() };
    return (
      <TemplateCard
        heading={this.heading(emptyButtonOnClick)}
        content={this.content()}
        emptyMessage={emptyMessage}
        emptyButtonLabel={emptyButtonLabel}
        emptyButtonOnClick={emptyButtonOnClick}
        disabled={false}
      />
    )
  }
}

UserCard.propTypes = {
  reducers: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired
}

export default UserCard
