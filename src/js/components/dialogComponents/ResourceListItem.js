import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Glyphicon } from 'react-bootstrap';
import Checkbox from 'material-ui/Checkbox';
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

export default function ResourceListItem({
  resource, checked, handleItemOnCheck,
}) {
  const [expanded, setExpanded] = useState(false);
  const languageCodeDetails = getLanguageByCode(resource.languageId);
  const languageName = languageCodeDetails
    ? languageCodeDetails.name
    : resource.languageId;
  const languageId = languageCodeDetails
    ? languageCodeDetails.code
    : resource.languageId;

  if (languageName) {
    return (
      <>
        <tr style={styles.tr}>
          <td style={styles.firstTd}>
            <Checkbox
              checked={checked}
              onCheck={(event) => {
                event.preventDefault();
                handleItemOnCheck(resource.languageId);
              }}
              label={`${languageName} (${languageId})`}
              style={styles.checkbox}
              iconStyle={styles.checkboxIconStyle}
              labelStyle={styles.checkboxLabelStyle}
            />
          </td>
          <td style={styles.td}>
            {`${resource.localModifiedTime.substring(0, 10)}`}
          </td>
          <td style={styles.td}>
            {`${resource.remoteModifiedTime.substring(0, 10)}`}
          </td>
          <td>
            <Glyphicon
              style={styles.glyphicon}
              glyph={expanded ? 'chevron-up' : 'chevron-down'}
              onClick={() => setExpanded(!expanded)}
            />
          </td>
        </tr>
        <SubItem items={['f', 'g']} expanded={expanded}/>
      </>
    );
  } else {
    // no details for this language so it is unsupported
    return null;
  }
};

ResourceListItem.propTypes = {
  resource: PropTypes.object.isRequired,
  checked: PropTypes.bool.isRequired,
  handleItemOnCheck: PropTypes.func.isRequired,
};

function SubItem({ items, expanded }) {
  return (
    <>
      {expanded && items.length > 0 &&
      items.map((item, i) => (
        <tr key={i} style={styles.tr}>
          <td style={styles.firstSubTd}>
            <Checkbox
              checked={false}
              onCheck={(event) => {
              }}
              label={`Resource Id`}
              style={styles.checkbox}
              iconStyle={styles.checkboxIconStyle}
              labelStyle={styles.checkboxLabelStyle}
            />
          </td>
          <td style={styles.td}>
            {`localModifiedTime`}
          </td>
          <td style={styles.td}>
            {`remoteModifiedTime`}
          </td>
        </tr>
      ))
      }
    </>
  );
}

SubItem.propTypes = {
  items: PropTypes.array,
  expanded: PropTypes.bool,
};
