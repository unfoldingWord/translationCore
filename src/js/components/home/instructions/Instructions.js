import React, { Component } from 'react';
import {Card, CardText} from 'material-ui/Card';

class Instructions extends Component {

  render() {
    let { homeInstructions } = this.props.reducers.BodyUIReducer;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        Instructions
        <Card style={{ height: '100%', marginTop: '5px' }}>
          <CardText>
            {homeInstructions}
          </CardText>
        </Card>
      </div>
    );
  }
}

export default Instructions
