// external
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Glyphicon } from 'react-bootstrap';
// components
import TemplateCard from '../TemplateCard';
import Hint from '../../Hint';


export default class UserCard extends Component {

  /**
  * @description generates the heading for the component
  * @param {function} callback - action for link
  * @return {component} - component returned
  */
  heading(callback) {
    const {translate} = this.props;
    const link = this.content() ? <a onClick={callback} style={{cursor: 'pointer'}}>{translate('home.logout')}</a> : <a/>;
    return (
      <span>{translate('home.overview.user_card.current_user')} {link}</span>
    );
  }

  /**
   * @description generates a detail for the contentDetails
   * @param {string} glyph - name of the glyph to be used
   * @param {string} text - text used for the detail
   * @return {component} - component returned
   */
  detail(glyph, text) {
    return (
      <div>
        <Glyphicon glyph={glyph} style={{ marginRight: '5px', top: '2px' }} />
        <span>{text}</span>
      </div>
    );
  }

  /**
  * @description generates the content for the component, conditionally empty
  * @return {component} - component returned
  */
  content() {
    let content; // content can be empty to fallback to empty button/message
    const {reducers} = this.props;
    const { loggedInUser, userdata } = reducers.loginReducer;

    if (loggedInUser) {
      content = (
        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '-10px 0 -24px 0' }}>
          <div style={{display: 'flex'}}>
            <div style={{ width: '100px', height: '110px', color: 'lightgray', margin: '-6px 20px -10px -16px', overflow: 'hidden'}}>
              <Glyphicon glyph="user" style={{fontSize: "100px"}} />
            </div>
            <div>
              <Hint position={'bottom'} label={userdata.username}>
                <strong style={{
                  fontSize: 'x-large',
                  overflow: 'hidden',
                  maxWidth: 400,
                  textOverflow: 'ellipsis',
                  display: 'block',
                  whiteSpace: 'nowrap'
                }}> {userdata.username} </strong>
              </Hint>
            </div>
          </div>
        </div>
      );
    }
    return content;
  }

  render() {
    const {translate} = this.props;
    const emptyMessage = translate('home.overview.user_card.login_required');
    const emptyButtonLabel = translate('home.overview.login');
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
