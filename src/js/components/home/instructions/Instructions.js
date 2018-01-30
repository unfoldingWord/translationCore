// external
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {Card, CardText} from 'material-ui/Card';

class Instructions extends Component {

  render() {
    let {translate} = this.props;
    let { homeInstructions } = this.props.reducers.homeScreenReducer;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {translate('home.instructions')}
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
  actions: PropTypes.object.isRequired,
  translate: PropTypes.func
};

export default Instructions;
