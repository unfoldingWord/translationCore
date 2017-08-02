import React from 'react';
import PropTypes from 'prop-types';
// components
import ProjectCard from './ProjectCard';

let MyProjects = ({myProjects, user, actions}) => {
  const projects = myProjects.map( (projectDetails, index) =>
    <ProjectCard user={user} key={index} projectDetails={projectDetails} actions={actions} />
  );

  return (
    <div style={{ height: '100%' }}>
      Projects
      <div style={{ height: '100%', overflowY: 'auto', paddingRight: '10px' }}>
        {projects}
      </div>
    </div>
  );
}

MyProjects.propTypes = {
  myProjects: PropTypes.array.isRequired,
  actions: PropTypes.object.isRequired
};

export default MyProjects;
