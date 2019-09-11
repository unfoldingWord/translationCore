import React from 'react';
import PropTypes from 'prop-types';
import InstructionsCard from './InstructionsCard';

const styles = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  height: '70%',
};

/**
 * This verbose component provides the structuring for components in the
 * HomeContainer
 * @param {*} instructions
 * @param {func} translate the translate function
 * @param {*} children
 * @return {*}
 * @constructor
 */
const HomeContainerContentWrapper = ({
  instructions, translate, children,
}) => (
  <div style={styles}>
    <div style={{ width: '400px', padding: '0 20px' }}>
      <InstructionsCard translate={translate}>
        {instructions}
      </InstructionsCard>
    </div>
    <div style={{
      width: '600px', padding: '0 20px', marginBottom: '25px',
    }}>
      <div style={{
        display: 'flex', flexDirection: 'column', height: '100%',
      }}>
        {children}
      </div>
    </div>
  </div>
);

HomeContainerContentWrapper.propTypes = {
  instructions: PropTypes.element.isRequired,
  children: PropTypes.element.isRequired,
  translate: PropTypes.func.isRequired,
};

export default HomeContainerContentWrapper;
