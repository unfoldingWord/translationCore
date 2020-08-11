import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { openOnlyProjectDetailsScreen } from '../../../../actions/ProjectInformationCheckActions';
import { uploadProject } from '../../../../actions/ProjectUploadActions';
import { exportToCSV } from '../../../../actions/CSVExportActions';
import { exportToUSFM } from '../../../../actions/USFMExportActions';
import { archiveProject } from '../../../../actions/MyProjects/MyProjectsActions';
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
    } = this.props;
    return <Menu user={user}
      translate={translate}
      onEdit={openOnlyProjectDetailsScreen}
      onUpload={uploadProject}
      onExportCSV={exportToCSV}
      onExportUSFM={exportToUSFM}
      onArchive={archiveProject}
      projectSaveLocation={projectSaveLocation}/>;
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
};

const mapDispatchToProps = {
  openOnlyProjectDetailsScreen,
  uploadProject,
  archiveProject,
  exportToCSV,
  exportToUSFM,
};
export default connect(null, mapDispatchToProps)(ProjectCardMenu);
