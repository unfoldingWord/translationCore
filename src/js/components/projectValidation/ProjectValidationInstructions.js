// external
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {Card, CardText} from 'material-ui/Card';

class ProjectValidationInstructions extends Component {

  render() {
    let { instructions } = this.props.reducers.projectValidationReducer || <div></div>;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        Instructions
        <Card style={{ height: '100%', lineHeight: '2em' }}>
          <CardText style={{height: '100%'}}>
            {instructions}
          </CardText>
        </Card>
      </div>
    );
  }
}

ProjectValidationInstructions.propTypes = {
  reducers: PropTypes.object.isRequired
}

export default ProjectValidationInstructions
