// external
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {Card, CardText} from 'material-ui/Card';

class Instructions extends Component {

  render() {
    let { homeInstructions } = this.props.reducers.homeScreenReducer;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        Instructions
        <Card style={{ height: '100%', marginTop: '5px', lineHeight: '2em' }}>
          <CardText>
            {homeInstructions}
          </CardText>
        </Card>
      </div>
    );
  }
}

Instructions.propTypes = {
  reducers: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired
};

export default Instructions;
