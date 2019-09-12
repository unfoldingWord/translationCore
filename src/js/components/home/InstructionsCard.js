import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardText } from 'material-ui/Card';

/**
 * Represents card containing instructions
 * @param {func} translate
 * @param {*} children
 * @return {*}
 * @constructor
 */
const InstructionsCard = ({ translate, children }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', height: '100%',
  }}>
    {translate('instructions')}
    <Card style={{
      height: '100%', marginTop: '5px', lineHeight: '2em',
    }}>
      <CardText>
        {children}
      </CardText>
    </Card>
  </div>
);

InstructionsCard.propTypes = {
  translate: PropTypes.func,
  children: PropTypes.any,
};

export default InstructionsCard;
