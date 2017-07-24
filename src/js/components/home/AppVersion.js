import React from 'react';
import PropTypes from 'prop-types';
import { Glyphicon } from 'react-bootstrap';

const AppVersion = ({
  actions: {
    openLicenseModal
  },
  version
}) => {
  return (
    <div style={{ textAlign: 'center', marginBottom: '10px' }}>
      <strong>traslationCore {version} </strong>
      <Glyphicon
        glyph="info-sign"
        style={{ fontSize: "16px", cursor: 'pointer', marginLeft: '5px' }}
        onClick={() => { openLicenseModal() }}
      />
    </div>
  );
};

AppVersion.propTypes = {
  actions: PropTypes.object.isRequired,
  version: PropTypes.string.isRequired
}

export default AppVersion;