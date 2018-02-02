import React from 'react';
import PropTypes from 'prop-types';
import ProjectValidationInstructions from './ProjectValidationInstructions';

const styles = {
  display: 'flex',
  flexDirection: 'row',
  height: '85%',
  marginTop: '10px'
};

/**
 * This verbose component provides the structuring for components in the
 * ProjectValidation container
 * @param {*} instructions
 * @param {func} translate the translate function
 * @param {*} children
 * @return {*}
 * @constructor
 */
const ProjectValidationContentWrapper = ({instructions, translate, children}) => (
  <div style={styles}>
    <div style={{ minWidth: '400px', height: '100%', padding: '0px 20px 0 65px' }}>
      <ProjectValidationInstructions translate={translate}>
        {instructions}
      </ProjectValidationInstructions>
    </div>
    <div style={{ height: '100%', width: '100%', padding: '0px 50px 22px 20px' }}>
      {children}
    </div>
  </div>
);

ProjectValidationContentWrapper.propTypes = {
  instructions: PropTypes.element.isRequired,
  children: PropTypes.element.isRequired,
  translate: PropTypes.func.isRequired
};

export default ProjectValidationContentWrapper;
