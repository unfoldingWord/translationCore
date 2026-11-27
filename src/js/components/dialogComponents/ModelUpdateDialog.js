import React from 'react';
import PropTypes from 'prop-types';
import Checkbox from 'material-ui/Checkbox';
import Divider from 'material-ui/Divider';
import BaseDialog from './BaseDialog';

const styles = {
  content: {
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    color: '#000000',
    textAlign: 'center',
    padding: '0px 0px 10px',
    margin: '25px 0px',
  },
  table: { width: '100%' },
  tr: { borderBottom: '1px solid rgb(224, 224, 224)' },
  firstTd: { padding: '10px 5px 10px 0px' },
  td: {
    minWidth: '120px',
    padding: '10px 5px',
  },
  checkboxContainer: {
    display: 'flex',
    margin: '20px 0px',
  },
  checkboxIconStyle: { fill: 'var(--accent-color-dark)' },
  checkboxLabelStyle: {
    width: '100%',
    fontWeight: 'normal',
  },
  boldCheckboxLabelStyle: { width: '100%' },
};

/**
 * @param {string} isoDate
 * @return {string} local date, or '' if missing
 */
function formatDate(isoDate) {
  const date = isoDate ? new Date(isoDate) : null;
  return date && !isNaN(date) ? date.toLocaleDateString() : '';
}

/**
 * Lists the AI models that are missing or different from the release, with a checkbox for each.
 *
 * @see {@link BaseDialog} for inner component information
 *
 * @property {func} translate - the localization function
 * @property {bool} open - controls whether the dialog is open or closed
 * @property {array} models - updates from ModelUpdatesActions.checkForModelUpdates()
 * @property {array} selectedModels - names of the checked models
 * @property {func} onModelSelection - called with a model name to toggle it
 * @property {func} onSelectAll - toggles all the models
 * @property {func} onDownload - downloads the checked models
 * @property {func} onClose - callback when the dialog is closed
 * @property {func} formatBytes - formats a size in bytes
 */
function ModelUpdateDialog({
  open,
  models,
  translate,
  selectedModels,
  onModelSelection,
  onSelectAll,
  onDownload,
  onClose,
  formatBytes,
}) {
  const allChecked = models.length > 0 && selectedModels.length === models.length;

  return (
    <BaseDialog
      open={open}
      primaryLabel={translate('updates.download')}
      secondaryLabel={translate('buttons.cancel_button')}
      primaryActionEnabled={selectedModels.length > 0}
      onSubmit={onDownload}
      onClose={onClose}
      title={translate('updates.update_ai_models')}
      modal={false}
      scrollableContent={true}
      titleStyle={{ marginBottom: '0px' }}
    >
      <div style={styles.content}>
        <h4 style={styles.header}>
          {translate('updates.select_the_models_to_download')}
        </h4>
        <Divider />
        <table style={styles.table}>
          <tbody>
            <tr style={styles.tr}>
              <th style={styles.firstTd}>{translate('updates.model_label')}</th>
              <th style={styles.td}>{translate('updates.model_installed')}</th>
              <th style={styles.td}>{translate('updates.model_available')}</th>
            </tr>
            {models.map((model) => {
              const installed = model.local ?
                `${formatBytes(model.local.size)}, ${formatDate(model.local.modified)}` :
                translate('updates.model_not_installed');

              return (
                <tr key={model.name} style={styles.tr}>
                  <td style={styles.firstTd}>
                    <Checkbox
                      label={model.name}
                      checked={selectedModels.includes(model.name)}
                      onCheck={() => onModelSelection(model.name)}
                      iconStyle={styles.checkboxIconStyle}
                      labelStyle={styles.checkboxLabelStyle}
                    />
                  </td>
                  <td style={styles.td}>{installed}</td>
                  <td style={styles.td}>
                    {`${formatBytes(model.size)}, ${formatDate(model.updatedAt)}`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div style={styles.checkboxContainer}>
          <Checkbox
            label={translate('updates.select_all_models')}
            checked={allChecked}
            onCheck={onSelectAll}
            iconStyle={styles.checkboxIconStyle}
            labelStyle={styles.boldCheckboxLabelStyle}
          />
        </div>
      </div>
    </BaseDialog>
  );
}

ModelUpdateDialog.propTypes = {
  open: PropTypes.bool,
  models: PropTypes.array.isRequired,
  translate: PropTypes.func.isRequired,
  selectedModels: PropTypes.array.isRequired,
  onModelSelection: PropTypes.func.isRequired,
  onSelectAll: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  formatBytes: PropTypes.func.isRequired,
};

export default ModelUpdateDialog;
