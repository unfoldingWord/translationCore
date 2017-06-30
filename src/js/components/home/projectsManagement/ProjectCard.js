import React from 'react';
import PropTypes from 'prop-types';
import { Glyphicon } from 'react-bootstrap';
// components
import TemplateCard from '../TemplateCard';

let Project = (props) => {
  const { projectName, projectSaveLocation, accessTimeAgo, bookAbbr, bookName, target_language} = props.projectDetails;
  let content = <div />;

  if (projectName && projectSaveLocation && accessTimeAgo && bookAbbr && bookName && target_language) {
    /**
    * @description generates a detail for the contentDetails
    * @param {string} glyph - name of the glyph to be used
    * @param {string} text - text used for the detail
    * @return {component} - component returned
    */
    const detail = (glyph, text) => {
      return (
        <div>
          <Glyphicon glyph={glyph} style={{ marginRight: '5px', top: '2px' }} />
          <span>{text}</span>
        </div>
      );
    }

    // content
    content = (
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '-10px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
          <strong style={{ fontSize: 'x-large' }}>{projectName}</strong>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '410px', marginBottom: '6px' }}>
            {detail('time', accessTimeAgo)}
            {detail('book', bookName + ' (' + bookAbbr + ')')}
            {detail('globe', target_language.name + ' (' + target_language.id + ')')}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textAlign: 'right', marginRight: '-6px' }}>
          <div>
            <Glyphicon glyph="option-vertical" style={{ fontSize: "large" }} />
          </div>
          <div>
            <button className='btn-prime' disabled={false} onClick={() => {props.actions.selectProject(projectSaveLocation)}} style={{ width: '90px', marginBottom: '0' }}>
              Select
            </button>
          </div>
        </div>
      </div>
    );

  }

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

Project.propTypes = {
  projectDetails: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired
};

export default Project;
