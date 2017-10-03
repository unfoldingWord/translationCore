import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Card, CardText } from 'material-ui';


class FABLabelCard extends Component {
  render() {
    return (
      <div style={{display: "flex", alignSelf: "flex-start" }}>
        <Card
          style={{
            display: "flex",
            justifyContent: "center",
            alignSelf: "flex-start",
            alignItems: "center",
            height: "40px",
            width: "200px"}}
          containerStyle={{ padding: "0px" }}
        >
          <CardText style={{ padding: "0px" }}>
            {this.props.label}
          </CardText>
        </Card>
      </div>
    );
  }
}

FABLabelCard.propTypes = {
    label: PropTypes.any
};

export default FABLabelCard;