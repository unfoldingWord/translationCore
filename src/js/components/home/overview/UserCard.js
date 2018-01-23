// external
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Glyphicon } from 'react-bootstrap';
// components
import TemplateCard from '../TemplateCard';

class UserCard extends Component {

  /**
  * @description generates the heading for the component
  * @param {function} callback - action for link
  * @return {component} - component returned
  */
  heading(callback) {
    const {translate} = this.props;
    const link = this.content() ? <a onClick={callback}>{translate('logout')}</a> : <a/>;
    return (
      <span>{translate('current_user')} {link}</span>
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
        <div style={{ display: 'flex', margin: '-10px 0 -24px 0' }}>
          <div style={{ width: '100px', height: '110px', color: 'lightgray', margin: '-6px 20px -10px -16px', overflow: 'hidden'}}>
            <Glyphicon glyph="user" style={{fontSize: "100px"}} />
          </div>
          <div style={{ width: '400px' }}>
            <strong style={{ fontSize: 'x-large' }}>{userdata.username}</strong>
          </div>
        </div>
      );
    }
    return content;
  }

  render() {
    const {translate} = this.props;
    const emptyMessage = translate('login_required');
    const emptyButtonLabel = translate('login');
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
    );
  }
}

UserCard.propTypes = {
  reducers: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  translate: PropTypes.func
};

export default UserCard;
