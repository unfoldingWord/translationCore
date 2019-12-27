import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getAlerts } from '../selectors';
import { closeAlert, ignoreAlert } from '../actions/AlertActions';
import Alert from './dialogs/Alert';

/**
 * Helper component to manage dom portals.
 */
class AlertPortal extends React.PureComponent {
  constructor(props) {
    super(props);
    this.el = document.createElement('div');
  }

  componentDidMount() {
    document.body.appendChild(this.el);
  }

  componentWillUnmount() {
    document.body.removeChild(this.el);
  }

  render() {
    return ReactDOM.createPortal(this.props.children, this.el);
  }
}

AlertPortal.propTypes = { children: PropTypes.any.isRequired };

/**
 * Manages the display of alerts within the application.
 * This is a new alert system that may eventually replace the existing alert system.
 */
class Alerts extends React.Component {
  constructor(props) {
    super(props);
    this.handleOnIgnore = this.handleOnIgnore.bind(this);
    this.handleOnCancel = this.handleOnCancel.bind(this);
    this.handleOnConfirm = this.handleOnConfirm.bind(this);
  }

  /**
   * Handles confirming.
   * This is required and will always produce a callback even if none is specified on the alert.
   * @param {object} alert - the alert properties
   * @return {Function}
   */
  handleOnConfirm(alert) {
    const { closeAlert } = this.props;

    return () => {
      closeAlert(alert.id);

      // propagate callback
      if (typeof alert.onConfirm === 'function') {
        alert.onConfirm();
      }
    };
  }

  /**
   * Handles canceling.
   * This is optional and will only produce a callback if one is specified on the alert.
   * @param {object} alert - the alert properties
   * @return {Function}
   */
  handleOnCancel(alert) {
    const { closeAlert } = this.props;

    if (typeof alert.onCancel === 'function') {
      return () => {
        closeAlert(alert.id);
        // propagate callback
        alert.onCancel();
      };
    }
  }

  /**
   * Handles ignoring the alert for the rest of the session.
   * This is optional and will only produce a callback if one is specified on the alert.
   * @param {object} alert - the alert properties
   * @return {Function}
   */
  handleOnIgnore(alert) {
    const { ignoreAlert } = this.props;

    if (typeof alert.onIgnore === 'function') {
      return ignored => {
        ignoreAlert(alert.id, ignored);
        // propagate callback
        alert.onIgnore(ignored);
      };
    }
  }

  render() {
    const alerts = this.props.alerts.map((item, i) => (
      <AlertPortal key={i}>
        <Alert {...item}
          onIgnore={this.handleOnIgnore(item)}
          onCancel={this.handleOnCancel(item)}
          onConfirm={this.handleOnConfirm(item)}
          open={true}/>
      </AlertPortal>
    ));

    return (
      <div className="modals">
        {alerts}
      </div>
    );
  }
}

Alerts.propTypes = {
  alerts: PropTypes.array,
  closeAlert: PropTypes.func.isRequired,
  ignoreAlert: PropTypes.func.isRequired,
};
Alerts.defaultProps = { alerts: [] };

const mapStateToProps = (state) => ({ alerts: getAlerts(state) });

const mapDispatchToProps = {
  closeAlert,
  ignoreAlert,
};

export default connect(mapStateToProps, mapDispatchToProps)(Alerts);
