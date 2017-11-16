import React from 'react';
import PropTypes from 'prop-types';
// components
import ProjectCard from './ProjectCard';

let MyProjects = ({myProjects, user, actions}) => {
  let projects = myProjects.map( (projectDetails, index) =>
    <ProjectCard user={user} key={index} projectDetails={projectDetails} actions={actions} />
  );

  if(myProjects.length == 0) {
    projects.push( <p><br/><b>No projects have been found. 
        Follow instructions at left to import a project.</b></p> );
  } 

  return (
    <div style={{ height: '100%' }}>
      Projects
      <div style={{ height: '100%', overflowY: 'auto', paddingRight: '10px' }}>
        {projects}
      </div>
    </div>
  );
};

MyProjects.propTypes = {
  myProjects: PropTypes.array.isRequired,
  user: PropTypes.any,
  actions: PropTypes.object.isRequired
};

export default MyProjects;
