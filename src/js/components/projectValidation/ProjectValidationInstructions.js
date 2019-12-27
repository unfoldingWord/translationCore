import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardText } from 'material-ui/Card';

// TODO: this is practically identical to components.home.InstructionsCard
// we should remove one of these and just use one generic one.
const ProjectValidationInstructions = ({ translate, children }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', height: '100%',
  }}>
    {translate('instructions')}
    <Card style={{ height: '100%', lineHeight: '2em' }}>
      <CardText style={{ height: '100%' }}>
        {children}
      </CardText>
    </Card>
  </div>
);

ProjectValidationInstructions.propTypes = {
  children: PropTypes.any,
  translate: PropTypes.func.isRequired,
};

export default ProjectValidationInstructions;
