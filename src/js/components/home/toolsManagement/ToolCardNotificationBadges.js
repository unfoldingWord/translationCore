import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Badge } from 'react-bootstrap';
import _ from 'lodash';
import Tooltip from '../../Tooltip';
import InvalidatedIcon from '../../svgIcons/InvalidatedIcon';
import { WORD_ALIGNMENT } from '../../../common/constants';

const makeStyles = errorCount => ({
  container: {
    display: 'flex',
    float: 'right',
  },
  tableRowItem: {
    padding: '5px',
    paddingRight: '10px',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  badge: {
    borderStyle: 'solid',
    borderRadius: '6px',
    color: errorCount > 0 ? '#ffffff' : '#000000',
    backgroundColor: errorCount > 0 ? 'var(--danger-color)' : '#ffffff',
    borderWidth: '1px',
    borderColor: errorCount > 0 ? 'var(--danger-color)' : '#000000',
  },
});

/**
 * Displays the error count
 * @param {number} count - the number of errors found
 * @param {string} tooltip - the tooltip message
 * @returns {*}
 * @constructor
 */
const ErrorCount = ({ count, tooltip }) => {
  const styles = makeStyles(count);
  return (
    <div style={styles.container}>
      <div>
        <table>
          <tbody>
            <tr style={{ display: 'flex' }}>
              <th style={styles.tableRowItem}>
                <Tooltip id="invalid-check-tooltip" placement="bottom" tooltipMessage={tooltip}>
                  <div>
                    <InvalidatedIcon />
                  </div>
                </Tooltip>&nbsp;
                <Badge style={styles.badge}>{count}</Badge>
              </th>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

ErrorCount.propTypes = {
  count: PropTypes.number.isRequired,
  tooltip: PropTypes.string.isRequired,
};

export default class ToolCardNotificationBadges extends Component {
  constructor(props) {
    super(props);
    const { tool } = props;
    this.loadInvalidCount = _.debounce(this.loadInvalidCount.bind(this), 200);

    // TRICKY: only display error count if supported by the tool
    this.state = {
      errorCount: 0,
      countEnabled: tool.api.methodExists('getInvalidChecks'),
    };
  }

  /**
   * Loads the number of invalid checks from the tool.
   */
  loadInvalidCount() {
    const { tool, selectedCategories } = this.props;
    const { errorCount, countEnabled } = this.state;

    if (countEnabled) {
      setTimeout(() => {
        const numInvalidChecks = tool.api.trigger('getInvalidChecks', selectedCategories);

        if (errorCount !== numInvalidChecks) {
          this.setState({ errorCount: numInvalidChecks });
        }
      }, 0);
    }
  }

  componentDidMount() {
    this.loadInvalidCount();
  }

  componentDidUpdate() {
    this.loadInvalidCount();
  }

  render() {
    const { tool, translate } = this.props;
    const { errorCount, countEnabled } = this.state;

    let message = '';

    if (tool.name === WORD_ALIGNMENT) {
      message = translate('tools.invalid_verse_alignments');
    } else {
      message = translate('tools.invalid_checks');
    }

    if (countEnabled) {
      return <ErrorCount count={errorCount} tooltip={message}/>;
    } else {
      return null;
    }
  }
}

ToolCardNotificationBadges.propTypes = {
  tool: PropTypes.object.isRequired,
  translate: PropTypes.func.isRequired,
  selectedCategories: PropTypes.array.isRequired,
};
