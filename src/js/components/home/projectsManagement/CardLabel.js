import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Card, CardText } from 'material-ui';


class CardLabel extends Component {
  render() {
    return (
      <div style={{ display: 'flex' }}>
        <Card
          onClick={() => this.props.action()}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignSelf: 'flex-start',
            alignItems: 'center',
            height: '40px',
            width: '200px',
            cursor: 'pointer',
          }}
          containerStyle={{ padding: '0px' }}
        >
          <CardText style={{ padding: '0px' }}>
            {this.props.label}
          </CardText>
        </Card>
      </div>
    );
  }
}

CardLabel.propTypes = {
  label: PropTypes.any,
  action: PropTypes.func.isRequired,
};

export default CardLabel;