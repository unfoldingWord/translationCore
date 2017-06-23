import React, { Component } from 'react'
import PropTypes from 'prop-types';
import {Card, CardText} from 'material-ui/Card';

class TemplateCard extends Component {

  button(text, onclick, disabled) {
    return (
      <button className='btn-prime' disabled={disabled} onClick={onclick} style={{ marginBottom: '0' }}>
        {text}
      </button>
    );
  }

  emptyContent(message, buttonLabel, onClick, disabled) {
    return (
      <div style={{ textAlign: 'center', paddingBottom: '0px' }}>
        {message}<br/>
        {this.button(buttonLabel, onClick, disabled)}
      </div>
    );
  }

  render() {
    let { emptyMessage, emptyButtonLabel, emptyButtonOnClick, disabled } = this.props;
    let emptyContent = this.emptyContent(emptyMessage, emptyButtonLabel, emptyButtonOnClick, disabled);
    let content = this.props.content ? this.props.content : emptyContent;
    let cardStyle = { marginTop: '5px' }
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
  emptyMessage: PropTypes.string.isRequired,
  emptyButtonLabel: PropTypes.string.isRequired,
  emptyButtonOnClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool
}

export default TemplateCard
