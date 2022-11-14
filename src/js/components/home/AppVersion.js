import React from 'react';
import PropTypes from 'prop-types';
import { Glyphicon } from 'react-bootstrap';
import { USE_QA_SERVER } from '../../common/constants';

const AppVersion = ({
  actions: { openLicenseModal },
  version,
}) => (
  <div style={{ textAlign: 'center', marginBottom: '10px' }}>
    <strong>translationCore {version} </strong>
    <Glyphicon
      glyph="info-sign"
      style={{
        fontSize: '16px', cursor: 'pointer', marginLeft: '5px',
      }}
      onClick={() => {
        openLicenseModal();
      }}
    />
    {USE_QA_SERVER ? <strong>&nbsp;&nbsp; - Using QA Server!</strong> : null}
  </div>
);

AppVersion.propTypes = {
  actions: PropTypes.object.isRequired,
  version: PropTypes.string.isRequired,
};

export default AppVersion;
