// external
import React, { Component } from 'react'
import PropTypes from 'prop-types';
import {Card, CardText} from 'material-ui/Card';

class TemplateCard extends Component {

  /**
  * @description generates the button for fallback
  * @param {string} buttonLabel - text in the button
  * @param {function} onClick - callback used if button clicked
  * @param {bool} disabled - disable the button
  * @return {component} - component returned
  */
  button(buttonLabel, onClick, disabled) {
    return (
      <button className='btn-prime' disabled={disabled} onClick={onClick} style={{ marginBottom: '0' }}>
        {buttonLabel}
      </button>
    );
  }

  /**
  * @description generates the button for fallback
  * @param {string} message - message above the button
  * @param {string} buttonLabel - text in the button
  * @param {function} onClick - callback used if button clicked
  * @param {bool} disabled - disable the button
  * @return {component} - component returned
  */
  emptyContent(message, buttonLabel, onClick, disabled) {
    return (
      <div style={{ textAlign: 'center', paddingBottom: '0px' }}>
        {message}<br/>
        {this.button(buttonLabel, onClick, disabled)}
      </div>
    );
  }

  render() {
    const { emptyMessage, emptyButtonLabel, emptyButtonOnClick, disabled } = this.props;
    const emptyContent = this.emptyContent(emptyMessage, emptyButtonLabel, emptyButtonOnClick, disabled);
    const content = this.props.content ? this.props.content : emptyContent;
    const cardStyle = { marginTop: '5px' }
    cardStyle.background = (disabled) ? 'var(--background-color-light)' : 'white';
    return (
      <div style={{flex:1}}>
        {this.props.heading}
        <Card style={cardStyle}>
          <CardText>
            {content}
          </CardText>
        </Card>
      </div>
    )
  }
}

TemplateCard.propTypes = {
  heading: PropTypes.object.isRequired,
  content: PropTypes.element,
  emptyMessage: PropTypes.string,
  emptyButtonLabel: PropTypes.string,
  emptyButtonOnClick: PropTypes.func,
  disabled: PropTypes.bool
};

export default TemplateCard
