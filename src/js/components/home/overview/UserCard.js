// external
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Glyphicon } from 'react-bootstrap';
// components
import TemplateCard from './TemplateCard';

class UserCard extends Component {

  /**
  * @description generates the heading for the component
  * @param {function} callback - action for link
  * @return {component} - component returned
  */
  heading(callback) {
    const link = this.content() ? <a onClick={callback}>Log out</a> : <a></a>
    return (
      <span>Current User {link}</span>
    );
  }

  /**
  * @description generates the content for the component, conditionally empty
  * @return {component} - component returned
  */
  content() {
    let content; // content can be empty to fallback to empty button/message
    const { loggedInUser, userdata } = this.props.reducers.loginReducer;
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
    const emptyMessage = 'Please log in to continue';
    const emptyButtonLabel = 'Login';
    const emptyButtonOnClick = () => { this.props.actions.goToNextStep() };
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
