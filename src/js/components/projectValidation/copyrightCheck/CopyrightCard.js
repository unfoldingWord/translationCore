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
  imageName,
  index,
  selectedLicenseId,
  toggleShowLicenseFile
}) => {
  const selectedCheckbox = id === selectedLicenseId;

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderBottom: index === 3 ? '' : '1px solid var(--background-color)', padding: '10px' }}>
      <img src={'images/' + imageName} height="94px" style={{ alignSelf: 'flex-start' }} />
      <div>
        <h4 style={{ fontWeight: 'bold'}}>
          {title}
        </h4>
        <span style={{ cursor: 'pointer', color: 'var(--accent-color)' }} onClick={() => toggleShowLicenseFile(id)}>
          See more
        </span>
      </div>
      <div>
        <Checkbox
          checked={selectedCheckbox}
          disabled={selectedLicenseId !== id && selectedLicenseId !== null}
          style={{ width: "20px", color: "#000000" }}
          iconStyle={{ fill: 'var(--accent-color-dark)' }}
          onCheck={() => selectedCheckbox ? selectProjectLicense(null) : selectProjectLicense(id)}
        />
      </div>
    </div>
  );
};

CopyrightCard.propTypes = {
  actions: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  imageName: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  selectedLicenseId: PropTypes.any,
  toggleShowLicenseFile: PropTypes.func.isRequired
}

export default CopyrightCard;