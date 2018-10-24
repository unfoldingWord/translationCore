import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getAlerts } from '../selectors';
import { closeAlert, ignoreAlert } from '../actions/AlertActions';
import Alert from './dialogs/Alert';

class AlertPortal extends React.PureComponent {
  constructor (props) {
    super(props);
    this.el = document.createElement('div');
  }

  componentDidMount () {
    document.body.appendChild(this.el);
  }

  componentWillUnmount () {
    document.body.removeChild(this.el);
  }

  render () {
    return ReactDOM.createPortal(this.props.children, this.el);
  }
}

AlertPortal.propTypes = {
  children: PropTypes.any.isRequired
};

class Alerts extends React.Component {

  constructor(props) {
    super(props);
    this.handleOnIgnore = this.handleOnIgnore.bind(this);
    this.handleOnCancel = this.handleOnCancel.bind(this);
    this.handleOnConfirm = this.handleOnConfirm.bind(this);
  }

  handleOnCancel(alert) {
    const {closeAlert} = this.props;
    if(typeof alert.onCancel === 'function') {
      return () => {
        closeAlert(alert.id);
        // propagate callback
        alert.onCancel();
      };
    }
  }

  handleOnConfirm(alert) {
    const {closeAlert} = this.props;
    return () => {
      closeAlert();
      // propagate callback
      if(typeof alert.onConfirm === 'function') {
        alert.onConfirm();
      }
    };
  }

  handleOnIgnore(alert) {
    const {ignoreAlert} = this.props;
    return ignored => {
      ignoreAlert(alert.id, ignored);
      // propagate callback
      if(typeof alert.onIgnore === 'function') {
        alert.onIgnore(ignored);
      }
    };
  }

  render () {
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
  ignoreAlert: PropTypes.func.isRequired
};
Alerts.defaultProps = {
  alerts: []
};

const mapStateToProps = (state) => {
  return {
    alerts: getAlerts(state)
  };
};
const mapDispatchToProps = {
  closeAlert,
  ignoreAlert
};

export default connect(mapStateToProps, mapDispatchToProps)(Alerts);
