/* eslint-disable no-console */
import React from 'react';
import PropTypes from 'prop-types';
// components
import { Checkbox } from 'material-ui';

const CopyrightCard = ({
  actions: {
    selectProjectLicense
  },
  title,
  id,
  description,
  imageName,
  index,
  selectedProjectLicense
}) => {
  let selectedCheckbox = id === selectedProjectLicense;

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
        checked={selectedCheckbox}
        disabled={selectedProjectLicense !== id && selectedProjectLicense !== null}
        style={{ width: "20px", color: "#000000" }}
        iconStyle={{ fill: 'var(--accent-color-dark)' }}
        onCheck={() => selectedCheckbox ? selectProjectLicense(null) : selectProjectLicense(id)}
      />
    </div>
  );
};

CopyrightCard.propTypes = {
  actions: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  imageName: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  selectedProjectLicense: PropTypes.any
}

export default CopyrightCard;