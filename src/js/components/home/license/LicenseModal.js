import React from 'react';
import PropTypes from 'prop-types';
import { Glyphicon } from 'react-bootstrap';
import { Dialog, CardHeader } from 'material-ui';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Licenses from './Licenses';

const LicenseModal = ({
  version,
  showLicenseModal,
  actions: {
    closeLicenseModal
  }
}) => {

  const buttonActions = [
    <button
      key={1}
      label="Close"
      className="btn-prime"
      onClick={closeLicenseModal}
    >
      Close
    </button>
  ];

  const headerContent = (
    <div>
      <span>{`translationCore ${version}`}</span>
        <Glyphicon
          onClick={closeLicenseModal}
          glyph={"remove"}
          style={{color: "var(--reverse-color)", cursor: "pointer", fontSize: "18px", float: "right"}}
        />
    </div>
  );

  return (
    <MuiThemeProvider>
      <Dialog
        contentStyle={{ minHeight: "550px", height: "550px", width: "900px", maxWidth: "900px" }}
        style={{ padding: "0px" }}
        autoDetectWindowHeight={true}
        // autoScrollBodyContent={true}
        open={showLicenseModal}
        actions={buttonActions}
        modal={true}
      >
        <CardHeader
          style={{
            color: "var(--reverse-color)",
            backgroundColor: 'var(--accent-color-dark)',
            padding: '15px', margin: "-44px -24px -24px -24px"
          }}
        >
          {headerContent}
        </CardHeader><br />
        <Licenses />
      </Dialog>
    </MuiThemeProvider>
  )
}

LicenseModal.propTypes = {
  version: PropTypes.string.isRequired,
  actions: PropTypes.object.isRequired,
  showLicenseModal: PropTypes.bool.isRequired
}

export default LicenseModal;
