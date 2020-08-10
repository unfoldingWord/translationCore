import React from 'react';
import PropTypes from 'prop-types';
// components
import ProjectCard from './ProjectCard';

const MyProjects = ({
  myProjects, user, onSelect, translate,
}) => {
  let projects = myProjects.map((projectDetails, index) =>
    <ProjectCard user={user}
      key={index}
      translate={translate}
      projectDetails={projectDetails}
      onSelect={onSelect}/>,
  );

  if (myProjects.length === 0) {
    projects.push(
      <p key={0}><br/>
        <b>
          {translate('projects.no_projects_found')}
        </b>
      </p>,
    );
  }

  return (
    <div style={{ height: '100%' }}>
      {translate('projects.projects')}
      <div style={{
        height: '100%', overflowY: 'auto', paddingRight: '10px',
      }}>
        {projects}
      </div>
    </div>
  );
};

MyProjects.propTypes = {
  translate: PropTypes.func.isRequired,
  myProjects: PropTypes.array.isRequired,
  user: PropTypes.any,
  onSelect: PropTypes.func.isRequired,
};

export default MyProjects;
