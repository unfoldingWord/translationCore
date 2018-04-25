import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Badge, Glyphicon } from 'react-bootstrap';
// components
import Tooltip from '../../Tooltip';
import InvalidatedIcon from '../../svgIcons/InvalidatedIcon';

const styles = {
  container: {
    display: 'flex',
    float: 'right'
  },
  tableRowItem: {
    padding: '5px',
    paddingRight: '10px',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  whiteBadge: {
    borderStyle: 'solid',
    borderColor: '#000000',
    borderWidth: '1px',
    backgroundColor: '#ffffff',
    color: '#000000',
    borderRadius: '6px',
  },
  redBadge: {
    backgroundColor: 'var(--danger-color)',
    color: '#ffffff',
    borderRadius: '6px',
  },
  yellowBadge: {
    borderStyle: 'solid',
    borderColor: '#000000',
    borderWidth: '1px',
    backgroundColor: 'var(--highlight-color)',
    color: '#000000',
    borderRadius: '6px',
  },
};

export default class ToolCardNotificationBadges extends Component {
  render() {
    const {
      invalidatedReducer,
      toolName
    } = this.props;
    const { invalidatedChecksTotal, verseEditsTotal } = invalidatedReducer;

    const verseEditsTooltip = 'Verses that have been edited since the last time this tool was opened.';
    const invalidatedChecksTooltip = 'Invalidated checks';
    const invalidatedAlignments = 'Verses with invalidated alignments.';
    const invalidatedMessage = toolName === 'wordAlignment' ? invalidatedAlignments : invalidatedChecksTooltip;
    const invalidatedAlignmentsTotal = 0;
    const invalidatedTotal = toolName === 'wordAlignment' ? invalidatedAlignmentsTotal : invalidatedChecksTotal;

    return (
      <div style={styles.container}>
        <div>
          <table>
            <tbody>
              <tr style={{ display: 'flex' }}>
                <th style={styles.tableRowItem}>
                  <Tooltip id="verse-edit-tooltip" placement="bottom" tooltipMessage={verseEditsTooltip}>
                    <Glyphicon glyph="pencil" style={{ fontSize: '18px' }} />
                  </Tooltip>&nbsp;
                  <Badge style={verseEditsTotal === 0 ? styles.whiteBadge : styles.redBadge}>{verseEditsTotal}</Badge>
                </th>
                <th style={styles.tableRowItem}>
                  <Tooltip id="invalid-check-tooltip" placement="bottom" tooltipMessage={invalidatedMessage}>
                    <div>
                      <InvalidatedIcon />
                    </div>
                  </Tooltip>&nbsp;
                  <Badge style={invalidatedTotal === 0 ? styles.whiteBadge : styles.redBadge}>{invalidatedTotal}</Badge>
                </th>
                <th style={styles.tableRowItem}>
                  <Glyphicon glyph="refresh" style={{ fontSize: '18px', cursor: 'pointer' }} />
                </th>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

ToolCardNotificationBadges.propTypes = {
  toolName: PropTypes.string.isRequired,
  invalidatedReducer: PropTypes.object.isRequired,
};
