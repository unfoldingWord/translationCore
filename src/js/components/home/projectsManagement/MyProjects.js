import React from 'react';
import PropTypes from 'prop-types';
// components
import ProjectCard from './ProjectCard';

let MyProjects = (props) => {
  let {myProjects} = props;

  const projects = myProjects.map( (projectDetails, index) =>
    <ProjectCard key={index} projectDetails={projectDetails} actions={props.actions} />
  );

  return (
    <div>
      Projects
      {projects}
    </div>
  );
}

MyProjects.propTypes = {
  myProjects: PropTypes.array.isRequired,
  actions: PropTypes.object.isRequired
};

export default MyProjects;
