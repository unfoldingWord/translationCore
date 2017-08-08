/* eslint-disable no-console */
import React from 'react';
import PropTypes from 'prop-types';
import { Checkbox } from 'material-ui';

const CopyrightCard = ({
  title,
  description,
  imageName,
  index
}) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderBottom: index === 3 ? '' : '1px solid var(--background-color)', padding: '10px' }}>
      <img src={'images/' + imageName} height="94px" />
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <h4 style={{ fontWeight: 'bold'}}>
          {title}
        </h4>
        <p>
          {description}
        </p>
      </div>
      <Checkbox
        // checked={project.html_url === importLink}
        // disabled={disabledCheckBox}
        style={{ width: "20px", color: "#000000" }}
        iconStyle={{ fill: 'var(--accent-color-dark)' }}
        onCheck={() => console.log('hey')}
      />
    </div>
  );
};

CopyrightCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  imageName: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired
}

export default CopyrightCard;