import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Badge, Glyphicon } from 'react-bootstrap';
// components
import InvalidatedIcon from '../../svgIcons/InvalidatedIcon';

const styles = {
  container: {
    display: 'flex',
    float: 'right'
  },
  tableRowItem: {
    padding: '5px'
  },
  whiteBadge: {
    borderStyle: 'solid',
    borderColor: '#000',
    borderWidth: '1px',
    backgroundColor: '#fff',
    color: '#000',
    borderRadius: '6px',
  },
  redBadge: {
    borderStyle: 'solid',
    borderColor: '#000',
    borderWidth: '1px',
    backgroundColor: '#fff',
    color: '#000',
    borderRadius: '6px',
  },
  yellowBadge: {
    borderStyle: 'solid',
    borderColor: '#000',
    borderWidth: '1px',
    backgroundColor: '#fff',
    color: '#000',
    borderRadius: '6px',
  },
};

export default class ToolCardNotificationBadges extends Component {
  render() {
    const {
      verseEdits,
      invalidatedChecks
    } = this.props;
    return (
      <div style={styles.container}>
        <div>
          <table>
            <tr>
              <th style={styles.tableRowItem}>
                <Glyphicon glyph="pencil" style={{ fontSize: '18px' }} />
              </th>
              <th style={styles.tableRowItem}>
                <Badge style={verseEdits === 0 ? styles.whiteBadge : styles.redBadge}>{verseEdits}</Badge>
              </th>
              <th style={styles.tableRowItem}>
                <InvalidatedIcon />
              </th>
              <th style={styles.tableRowItem}>
                <Badge style={invalidatedChecks === 0 ? styles.whiteBadge : styles.redBadge}>{verseEdits}</Badge>
              </th>
            </tr>
          </table>
        </div>
      </div>
    );
  }
}

ToolCardNotificationBadges.propTypes = {
  verseEdits: PropTypes.number.isRequired,
  invalidatedChecks: PropTypes.number.isRequired,
};
