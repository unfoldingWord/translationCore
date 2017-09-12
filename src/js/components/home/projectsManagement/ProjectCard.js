import React from 'react';
import PropTypes from 'prop-types';
import { Glyphicon } from 'react-bootstrap';
// components
import TemplateCard from '../TemplateCard';
import ProjectCardMenu from './ProjectCardMenu'

let ProjectCard = (props) => {
  const { projectName, projectSaveLocation, accessTimeAgo, bookAbbr, bookName, target_language, isSelected } = props.projectDetails;
  let cardDetails = [
    {
      glyph: 'time',
      text: accessTimeAgo
    },
    {
      glyph: 'book',
      text: bookName && bookAbbr ? bookName + ' (' + bookAbbr + ')' : 'No book information found'
    },
    {
      glyph: 'globe',
      text: target_language.name && target_language.id ? target_language.name + ' (' + target_language.id + ')' : 'No language information found'
    }
  ]

  // content
  let content = (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '-10px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
        <strong style={{ fontSize: 'x-large' }}>{projectName}</strong>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '410px', marginBottom: '6px' }}>
          {
            cardDetails.map((cardDetail) => {
              return (
                <div key={cardDetail.glyph}>
                  <Glyphicon glyph={cardDetail.glyph} style={{ marginRight: '5px', top: '2px' }} />
                  <span>{cardDetail.text}</span>
                </div>
              );
            })
          }
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textAlign: 'right', marginRight: '-6px' }}>
        <ProjectCardMenu projectSaveLocation={projectSaveLocation} {...props} />
        <div>
          <button className='btn-prime' disabled={isSelected} onClick={() => {props.actions.selectProject(projectSaveLocation)}} style={{ width: '90px', marginBottom: '0' }}>
            Select
          </button>
        </div>
      </div>
    </div>
  );

  // heading
  const heading = (
    <span></span>
  );

  return (
    <TemplateCard
      heading={heading}
      content={content}
    />
  );
}

ProjectCard.propTypes = {
  projectDetails: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired
};

export default ProjectCard;
