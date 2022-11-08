import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Glyphicon } from 'react-bootstrap';
import Checkbox from '@material-ui/core/Checkbox';
import { withStyles } from '@material-ui/core/styles';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import CheckBoxOutlineIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import IndeterminateCheckBoxIcon from '@material-ui/icons/IndeterminateCheckBox';
import _ from 'lodash';
// helpers
import { getLanguageByCode } from '../../helpers/LanguageHelpers';

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
  resourcesList: {},
  resourcesListItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '15px 0px 0px',
  },
  table: { width: '100%' },
  tr: { borderBottom: '1px solid rgb(224, 224, 224)' },
  firstTd: {
    width: '80%',
    padding: '10px 5px 10px 0px',
  },
  firstSubTd: {
    width: '80%',
    padding: '10px 0px 10px 20px',
  },
  td: {
    width: '100%',
    minWidth: '300px',
    padding: '10px 0px 10px',
  },
  onlineTd: {
    textAlign: 'center',
    width: '100%',
    minWidth: '100px',
    padding: '10px 0px 10px',
  },
  glyphicon: {
    fontSize: '18px',
    margin: '0 12px 0 0',
    width: '20px',
    textAlign: 'right',
  },
  label: {
    fontSize: '16px',
    color: 'rgba(0, 0, 0, 0.6)',
    fontFamily: 'Ezra, Noto Sans',
  },
  root: {
    'color': 'var(--accent-color-dark)',
    '&$checked': { color: 'var(--accent-color-dark)' },
    'padding': '0px',
  },
  checked: {},
};

function ResourceListItem({
  classes,
  checked,
  translate,
  indeterminate,
  selectedSubitems,
  languageResources,
  onSubitemSelection,
  onLanguageSelection,
}) {
  const [expanded, setExpanded] = useState(false);
  const languageCodeDetails = getLanguageByCode(languageResources.languageId);
  const languageName = languageCodeDetails
    ? languageCodeDetails.name
    : languageResources.languageId;
  const languageId = languageCodeDetails
    ? languageCodeDetails.code
    : languageResources.languageId;

  if (languageName) {
    return (
      <>
        <tr style={styles.tr}>
          <td style={styles.firstTd}>
            <FormControlLabel
              classes={{ label: classes.label }}
              control={
                <Checkbox
                  checked={checked}
                  indeterminate={indeterminate}
                  classes={{
                    root: classes.root,
                    checked: classes.checked,
                  }}
                  onChange={() => onLanguageSelection(languageResources)}
                  icon={<CheckBoxOutlineIcon style={{ fontSize: '24px' }} />}
                  checkedIcon={<CheckBoxIcon style={{ fontSize: '24px' }} />}
                  indeterminateIcon={<IndeterminateCheckBoxIcon style={{ fontSize: '24px' }} />}
                />
              }
              label={`${languageName} (${languageId})`}
            />
          </td>
          <td style={styles.td}>
            {`${languageResources.localModifiedTime.substring(0, 10)}`}
          </td>
          <td style={styles.onlineTd}>
            {`${languageResources.remoteModifiedTime.substring(0, 10)}`}
          </td>
          <td>
            <Glyphicon
              style={styles.glyphicon}
              glyph={expanded ? 'chevron-up' : 'chevron-down'}
              onClick={() => setExpanded(!expanded)}
            />
          </td>
        </tr>
        <Subitems
          classes={classes}
          expanded={expanded}
          translate={translate}
          items={languageResources.resources}
          selectedSubitems={selectedSubitems}
          onSubitemSelection={onSubitemSelection}
          languageId={languageResources.languageId}
        />
      </>
    );
  } else {
    // no details for this language so it is unsupported
    return null;
  }
};

ResourceListItem.propTypes = {
  selectedSubitems: PropTypes.array,
  checked: PropTypes.bool.isRequired,
  classes: PropTypes.object.isRequired,
  translate: PropTypes.func.isRequired,
  indeterminate: PropTypes.bool.isRequired,
  onSubitemSelection: PropTypes.func.isRequired,
  languageResources: PropTypes.object.isRequired,
  onLanguageSelection: PropTypes.func.isRequired,
};

function Subitems({
  items,
  classes,
  expanded,
  translate,
  languageId,
  selectedSubitems,
  onSubitemSelection,
}) {
  function getItemLabel(item) {
    let label = `${item.resourceId.toUpperCase()} - ${item.subject}`;
    const owner = item?.catalogEntry?.resource?.owner;
    const isD43 = owner === 'Door43-Catalog';

    if (!isD43) {
      const stage = item?.catalogEntry?.resource?.stage;
      const isProduction = stage === 'prod';

      if (!isProduction) {
        label = `[${label}] - ${translate('pre_release')}`;
      }
    }
    return label;
  }

  if (expanded) {
    return (
      <>
        {items.length > 0 && (
          <tr key='header-row-0' style={styles.tr}>
            <td style={styles.firstSubTd}>
              <b>{translate('updates.resource')}:</b>
            </td>
            <td style={styles.td}>
              <b>{translate('updates.organization')}:</b>
            </td>
            <td style={styles.onlineTd}>
            </td>
          </tr>
        )}
        {
          items.length > 0 &&
          items.map((item, i) => {
            const checked = !!_.find(selectedSubitems, item);

            return (
              <tr key={i} style={styles.tr}>
                <td style={styles.firstSubTd}>
                  <FormControlLabel
                    classes={{ label: classes.label }}
                    control={
                      <Checkbox
                        checked={checked}
                        classes={{
                          root: classes.root,
                          checked: classes.checked,
                        }}
                        onChange={() => onSubitemSelection(item, languageId)}
                        icon={<CheckBoxOutlineIcon style={{ fontSize: '24px' }} />}
                        checkedIcon={<CheckBoxIcon style={{ fontSize: '24px' }} />}
                      />
                    }
                    label={getItemLabel(item)}
                  />
                </td>
                <td style={styles.td}>
                  {item.owner}
                </td>
                <td style={styles.onlineTd}>
                  {item.remoteModifiedTime.substring(0, 10)}
                </td>
              </tr>
            );
          })
        }
      </>
    );
  } else {
    return null;
  }
}

Subitems.propTypes = {
  items: PropTypes.array,
  expanded: PropTypes.bool,
  languageId: PropTypes.string,
  selectedSubitems: PropTypes.array,
  translate: PropTypes.func.isRequired,
  onSubitemSelection: PropTypes.func.isRequired,
};

export default withStyles(styles)(ResourceListItem);
