import React, { Component } from 'react';
import PropTypes from 'prop-types';
// components
import LicenseMarkdown from './LicenseMarkdown';
import CopyrightCard from './CopyrightCard';
import { Card } from 'material-ui/Card';

class CopyrightCheck extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showLicenseFile: false
    };
  }

  componentDidMount() {
    this.props.actions.changeProjectValidationInstructions(
      <div>
        <span>Please select the copyright status for this project.</span>
      </div>
    );
  }

  toggleShowLicenseFile(licenseId) {
    if (licenseId) {
      this.props.actions.loadProjectLicenseMarkdownFile(licenseId);
    }
    this.setState({
      showLicenseFile: !this.state.showLicenseFile
    });
  }

  render() {
    const { selectedLicenseId, projectLicenseMarkdown } = this.props.reducers.copyrightCheckReducer;
    const licenses = [
      {
        title: 'CC0 / Public Domain',
        id: 'CC0 1.0 Public Domain',
        imageName: 'publicDomain.png'
      },
      {
        title: 'Creative Commons Attribution (CC BY)',
        id: 'CC BY 4.0',
        imageName: 'ccBy.png'
      },
      {
        title: 'Creative Commons Attribution-ShareAlike (CC BY-SA)',
        id: 'CC BY-SA 4.0',
        imageName: 'ccBySa.png'
      },
      {
        title: 'None of the Above',
        id: 'none',
        imageName: 'noCircle.png'
      }
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        Licenses
        <Card
          style={{ width: '100%', height: '100%' }}
          containerStyle={{ overflowY: 'auto', overflowX: 'hidden', height: '100%' }}
        >
        {
          this.state.showLicenseFile ?
            <LicenseMarkdown
              markdownFile={projectLicenseMarkdown}
              toggleShowLicenseFile={(licenseId) => this.toggleShowLicenseFile(licenseId)}
            />
            : (
              licenses.map((license, index) => {
                return (
                  <CopyrightCard
                    key={index}
                    index={index}
                    id={license.id}
                    title={license.title}
                    actions={this.props.actions}
                    imageName={license.imageName}
                    selectedLicenseId={selectedLicenseId}
                    toggleShowLicenseFile={(licenseId) => this.toggleShowLicenseFile(licenseId)}
                  />
                );
              })
            )
        }
        </Card>
      </div>
    );
  }
}

CopyrightCheck.propTypes = {
  actions: PropTypes.object.isRequired,
  reducers: PropTypes.object.isRequired
};

export default CopyrightCheck;
