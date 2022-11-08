import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// eslint-disable-next-line no-unused-vars
import { closeAlertDialog, openOptionDialog } from '../actions/AlertModalActions';
import PreviewContent from '../components/PreviewContent';
import * as LoadHelpers from '../helpers/LoadHelpers';

import { getUsfm2ExportFile } from '../actions/USFMExportActions';


/**
 * Renders a dialog to submit user feedback.
 *
 * @class
 *
 * @property {func} translate - the localization function
 * @property {func} onClose - callback when the dialog is closed
 * @property {bool} open - controls whether the dialog is open or closed
 */
class PrintPreviewDialogContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = { };
  }

  render() {
    const { projectSaveLocation } = this.props;

    const manifest = LoadHelpers.loadFile(projectSaveLocation, 'manifest.json');
    const languageId = manifest?.target_language?.id || '';
    const bookId = manifest?.project?.id || '';
    const typeName = manifest?.project?.name || '';
    const usfm = getUsfm2ExportFile(projectSaveLocation);

    return <PreviewContent
      bookId={bookId}
      usfm={usfm}
      languageId={languageId}
      typeName={typeName}
      active={true}
      onRefresh={() => {}}
      onAction={() => {}}
    />;
  }
}

PrintPreviewDialogContainer.propTypes = { projectSaveLocation: PropTypes.string.isRequired };

const mapStateToProps = (state) => ({
});

const mapDispatchToProps = {
  openOptionDialog,
};

export default connect(mapStateToProps, mapDispatchToProps)(PrintPreviewDialogContainer);
