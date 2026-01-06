import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { openOnlyProjectDetailsScreen } from '../../../../actions/ProjectInformationCheckActions';
import { uploadProject } from '../../../../actions/ProjectUploadActions';
import { exportToCSV } from '../../../../actions/CSVExportActions';
import { exportToUSFM } from '../../../../actions/USFMExportActions';
import { archiveProject, exportProject } from '../../../../actions/MyProjects/MyProjectsActions';
import { promptForViewUrl } from '../../../../actions/MyProjects/ProjectLoadingActions';
import { doPrintPreview } from '../../../../helpers/PrintPreviewHelpers';
import Menu from './Menu';

/**
 * Connects actions to the project menu
 */
class ProjectCardMenu extends React.Component {
  render() {
    const {
      doPrintPreview,
      archiveProject,
      exportProject,
      exportToCSV,
      exportToUSFM,
      openOnlyProjectDetailsScreen,
      projectSaveLocation,
      promptForViewUrl,
      translate,
      uploadProject,
      user,
    } = this.props;

    function loadUrl() {
      promptForViewUrl(projectSaveLocation, translate);
    }

    return <Menu user={user}
      onArchive={archiveProject}
      onEdit={openOnlyProjectDetailsScreen}
      onExportCSV={exportToCSV}
      onExportUSFM={exportToUSFM}
      onExportZip={exportProject}
      onLoadUrl={loadUrl}
      onUpload={uploadProject}
      onPrintPreview={doPrintPreview}
      projectSaveLocation={projectSaveLocation}
      translate={translate}
    />;
  }
}

ProjectCardMenu.propTypes = {
  archiveProject: PropTypes.func.isRequired,
  doPrintPreview: PropTypes.func.isRequired,
  exportProject: PropTypes.func.isRequired,
  exportToCSV: PropTypes.func.isRequired,
  exportToUSFM: PropTypes.func.isRequired,
  openOnlyProjectDetailsScreen: PropTypes.func.isRequired,
  projectSaveLocation: PropTypes.string.isRequired,
  promptForViewUrl: PropTypes.func.isRequired,
  translate: PropTypes.func.isRequired,
  uploadProject: PropTypes.func.isRequired,
  user: PropTypes.any.isRequired,
};

const mapDispatchToProps = {
  archiveProject,
  doPrintPreview,
  exportProject,
  exportToCSV,
  exportToUSFM,
  openOnlyProjectDetailsScreen,
  promptForViewUrl,
  uploadProject,
};
export default connect(null, mapDispatchToProps)(ProjectCardMenu);
