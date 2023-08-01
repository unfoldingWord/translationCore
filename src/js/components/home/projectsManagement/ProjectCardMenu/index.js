import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { openOnlyProjectDetailsScreen } from '../../../../actions/ProjectInformationCheckActions';
import { uploadProject } from '../../../../actions/ProjectUploadActions';
import { exportToCSV } from '../../../../actions/CSVExportActions';
import { exportToUSFM } from '../../../../actions/USFMExportActions';
import { archiveProject } from '../../../../actions/MyProjects/MyProjectsActions';
import { promptForViewUrl } from '../../../../actions/MyProjects/ProjectLoadingActions';
import { doPrintPreview } from '../../../../helpers/PrintPreviewHelpers';
import Menu from './Menu';

/**
 * Connects actions to the project menu
 */
class ProjectCardMenu extends React.Component {
  render() {
    const {
      user,
      projectSaveLocation,
      translate,
      openOnlyProjectDetailsScreen,
      uploadProject,
      archiveProject,
      exportToUSFM,
      exportToCSV,
      promptForViewUrl,
      doPrintPreview,
    } = this.props;

    function loadUrl() {
      promptForViewUrl(projectSaveLocation, translate);
    }

    return <Menu user={user}
      translate={translate}
      onEdit={openOnlyProjectDetailsScreen}
      onUpload={uploadProject}
      onExportCSV={exportToCSV}
      onExportUSFM={exportToUSFM}
      onArchive={archiveProject}
      onLoadUrl={loadUrl}
      projectSaveLocation={projectSaveLocation}
      onPrintPreview={doPrintPreview}
    />;
  }
}

ProjectCardMenu.propTypes = {
  user: PropTypes.any.isRequired,
  projectSaveLocation: PropTypes.string.isRequired,
  translate: PropTypes.func.isRequired,

  openOnlyProjectDetailsScreen: PropTypes.func.isRequired,
  archiveProject: PropTypes.func.isRequired,
  uploadProject: PropTypes.func.isRequired,
  exportToCSV: PropTypes.func.isRequired,
  exportToUSFM: PropTypes.func.isRequired,
  promptForViewUrl: PropTypes.func.isRequired,
  doPrintPreview: PropTypes.func.isRequired,
};

const mapDispatchToProps = {
  openOnlyProjectDetailsScreen,
  uploadProject,
  archiveProject,
  exportToCSV,
  exportToUSFM,
  promptForViewUrl,
  doPrintPreview,
};
export default connect(null, mapDispatchToProps)(ProjectCardMenu);
