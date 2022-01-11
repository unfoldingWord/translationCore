import React from 'react';
import PropTypes from 'prop-types';
import Checkbox from 'material-ui/Checkbox';
import Divider from 'material-ui/Divider';

import BaseDialog from './BaseDialog';
import ResourceListItem from './ResourceListItem';

const styles = {
  content: {
    display: 'flex',
    flexDirection: 'column',
  },
  checkboxContainer: {
    display: 'flex',
    marginBottom: '20px',
  },
  header: {
    color: '#000000',
    textAlign: 'center',
    padding: '0px 0px 10px',
    margin: '25px 0px',
  },
  checkbox: {},
  checkboxIconStyle: { fill: 'var(--accent-color-dark)' },
  checkboxLabelStyle: {
    width: '100%',
    fontWeight: 'normal',
  },
  boldCheckboxLabelStyle: { width: '100%' },
  resourcesList: {},
  resourcesListItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '15px 0px 0px',
  },
  table: { width: '100%' },
  tr: { borderBottom: '1px solid rgb(224, 224, 224)' },
  firstTd: { padding: '10px 5px 10px 0px' },
  firstSubTd: { padding: '10px 5px 10px 30px' },
  td: {
    minWidth: '200px',
    padding: '10px 5px',
  },
  glyphicon: {
    fontSize: '18px',
    margin: '0 12px 0 0',
    width: '20px',
    textAlign: 'right',
  },
};

/**
 * Renders a success dialog
 *
 * @see {@link BaseDialog} for inner component information
 *
 * @property {func} translate - the localization function
 * @property {bool} open - controls whether the dialog is open or closed
 * @property {func} onClose - callback when the dialog is closed
 * @property {array} resources - array of resources
 */
class ContentUpdateDialog extends React.Component {
  render() {
    const {
      translate,
      open,
      onDownload,
      onClose,
      resources,
      selectedItems,
      handleListItemSelection,
      handleAllListItemsSelection,
    } = this.props;

    const availableLanguageIds = resources.map(
      (resource) => resource.languageId,
    );
    const allChecked =
      JSON.stringify(availableLanguageIds) === JSON.stringify(selectedItems);

    return (
      <BaseDialog
        open={open}
        primaryLabel={translate('updates.download')}
        secondaryLabel={translate('buttons.cancel_button')}
        primaryActionEnabled={selectedItems.length > 0}
        onSubmit={onDownload}
        onClose={onClose}
        title={translate('updates.update_gateway_language_content')}
        modal={false}
        scrollableContent={true}
        titleStyle={{ marginBottom: '0px' }}
      >
        <div style={styles.content}>
          <div>
            <h4 style={styles.header}>
              {translate(
                'updates.select_the_gateway_language_content_to_download',
              )}
            </h4>
            <div style={styles.checkboxContainer}>
              <Checkbox
                label={translate('select_all')}
                checked={allChecked}
                onCheck={handleAllListItemsSelection}
                style={styles.checkbox}
                iconStyle={styles.checkboxIconStyle}
                labelStyle={styles.boldCheckboxLabelStyle}
              />
            </div>
            <Divider />
          </div>
          <div style={styles.resourcesList}>
            <table style={styles.table}>
              <tbody>
                <tr style={styles.tr}>
                  <th style={styles.firstTd}>
                    {translate('updates.source_label')}
                  </th>
                  <th style={styles.td}>
                    {translate('updates.local_timestamp')}
                  </th>
                  <th style={styles.td}>
                    {translate('updates.online_timestamp')}
                  </th>
                  <th></th>
                </tr>
                {resources.map((resource) => (
                  <ResourceListItem
                    key={resource.languageId}
                    resource={resource}
                    checked={selectedItems.includes(resource.languageId)}
                    handleItemOnCheck={handleListItemSelection}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </BaseDialog>
    );
  }
}

ContentUpdateDialog.propTypes = {
  translate: PropTypes.func.isRequired,
  open: PropTypes.bool,
  onDownload: PropTypes.func,
  onClose: PropTypes.func,
  resources: PropTypes.array.isRequired,
  selectedItems: PropTypes.array.isRequired,
  handleListItemSelection: PropTypes.func.isRequired,
  handleAllListItemsSelection: PropTypes.func.isRequired,
};

export default ContentUpdateDialog;
