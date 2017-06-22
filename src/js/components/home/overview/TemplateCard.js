import React, { Component } from 'react'
import {Card, CardText} from 'material-ui/Card';

class UserCard extends Component {

  button(text, onclick) {
    let disabled = false;
    let className = 'btn-prime';
    return (
      <button className={className} disabled={disabled} onClick={onclick} style={{ marginBottom: '0' }}>
        {text}
      </button>
    );
  }

  emptyContent(message, buttonLabel, onClick) {
    return (
      <div style={{ textAlign: 'center' }}>
        {message}<br/>
        {this.button(buttonLabel, onClick)}
      </div>
    );
  }

  render() {
    let { emptyMessage, emptyButtonLabel, emptyButtonOnClick } = this.props;
    let emptyContent = this.emptyContent(emptyMessage, emptyButtonLabel, emptyButtonOnClick);
    let content = this.props.content ? this.props.content : emptyContent;
    return (
      <div style={{ padding: '0 0 20px 0' }}>
        {this.props.heading}
        <Card style={{ marginTop: '5px' }}>
          <CardText>
            {content}
          </CardText>
        </Card>
      </div>
    )
  }
}

export default UserCard
