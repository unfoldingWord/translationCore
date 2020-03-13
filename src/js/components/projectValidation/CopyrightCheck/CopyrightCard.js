/* eslint-disable no-console */
import React from 'react';
import PropTypes from 'prop-types';
// components
import { Checkbox } from 'material-ui';

const CopyrightCard = ({
  selectProjectLicense,
  title,
  id,
  image,
  index,
  selectedLicenseId,
  toggleShowLicenseFile,
  translate,
}) => {
  const selectedCheckbox = id === selectedLicenseId;
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderBottom: index === 3 ? '' : '1px solid var(--background-color)', padding: '22px',
    }}>
      <div style={{ display: 'flex' }}>
        <img src={image} height="70px" />
        <div style={{ marginLeft: '20px' }}>
          <h4 style={{ fontWeight: 'bold' }}>
            {title}
          </h4>
          <span style={{ cursor: 'pointer', color: 'var(--accent-color)' }} onClick={() => toggleShowLicenseFile(id)}>
            {translate('tools.see_more')}
          </span>
        </div>
      </div>
      <div>
        <Checkbox
          checked={selectedCheckbox}
          style={{ width: '20px', color: '#000000' }}
          iconStyle={{ fill: 'var(--accent-color-dark)' }}
          onCheck={() => selectProjectLicense(id)}
        />
      </div>
    </div>
  );
};

CopyrightCard.propTypes = {
  translate: PropTypes.func.isRequired,
  selectProjectLicense: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  image: PropTypes.any.isRequired,
  index: PropTypes.number.isRequired,
  selectedLicenseId: PropTypes.any,
  toggleShowLicenseFile: PropTypes.func.isRequired,
};

export default CopyrightCard;
