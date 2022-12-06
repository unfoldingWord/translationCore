import React from 'react';
import PropTypes from 'prop-types';
import { Glyphicon } from 'react-bootstrap';
import { DCS_BASE_URL, USE_QA_SERVER } from '../../common/constants';

function getQaServerMessage() {
  return <strong>&nbsp;&nbsp; - Using QA Server {DCS_BASE_URL}</strong>;
}

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
    {USE_QA_SERVER ? getQaServerMessage() : null}
  </div>
);

AppVersion.propTypes = {
  actions: PropTypes.object.isRequired,
  version: PropTypes.string.isRequired,
};

export default AppVersion;
