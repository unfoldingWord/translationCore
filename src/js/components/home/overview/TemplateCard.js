import React, { Component } from 'react'
import {Card, CardText} from 'material-ui/Card';

class UserCard extends Component {

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
      <div style={{ padding: '0 0 20px 0' }}>
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

export default UserCard
