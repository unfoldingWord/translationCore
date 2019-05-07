import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// containers
import HomeContainer from './HomeContainer';
import ToolContainer from '../ToolContainer';
import { getActiveLocaleLanguage, getIsSoftwareUpdateOpen } from '../../selectors';
import { withLocale } from '../Locale';
import SoftwareUpdatesDialog from "../SoftwareUpdateDialog";
import { closeSoftwareUpdate } from "../../actions/SoftwareUpdateActions";

const styles = {
  root: {
    display: 'flex',
    height: '100vh',
    width: '100%'
  },
  errorRoot: {
    height: '100vh',
    margin: '40px'
  },
  errorCode: {
    color: '#cc3939',
    backgroundColor: '#ffe6e6',
    lineHeight: '150%',
    whiteSpace: 'pre-wrap',
    padding: '20px',
    border: 'solid 1px rgb(204, 57, 57)',
    fontSize: '120%'
  },
  errorTitle: {
    textAlign: 'center',
    width: '100%'
  }
};

class BodyContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      errorInfo: null
    };
    this.handleCloseSoftwareUpdate=this.handleCloseSoftwareUpdate.bind(this);
  }

  componentDidCatch(error, info) {
    this.setState({
      error,
      errorInfo: info
    });
  }

  handleCloseSoftwareUpdate() {
    this.props.closeSoftwareUpdate();
  }

  render () {
    const {currentLanguage, translate, isSoftwareUpdateOpen} = this.props;
    const {displayHomeView} = this.props.reducers.homeScreenReducer;
    const { error, errorInfo } = this.state;

    const softwareUpdateDialog = (
      <SoftwareUpdatesDialog open={isSoftwareUpdateOpen}
        translate={translate}
        onClose={this.handleCloseSoftwareUpdate}/>
    );

    if(error !== null) {
      return (
        <div style={styles.errorRoot}>
          <h1 style={styles.errorTitle}>A critical error has occurred</h1>
          <div style={styles.errorCode}>
            {error && error.toString()}
            <br/>
            {errorInfo.componentStack}
          </div>
        </div>
      );
    } else if (displayHomeView) {
      return (
        <div style={styles.root}>
          <HomeContainer translate={translate}
                         currentLanguage={currentLanguage}/>
          {softwareUpdateDialog}
        </div>
      );
    } else {
      return (
        <div style={styles.root}>
          <ToolContainer currentLanguage={currentLanguage}
                         translate={translate}/>
          {softwareUpdateDialog}
        </div>
      );
    }
  }
}

const mapStateToProps = (state) => {
  return {
    reducers: {
      homeScreenReducer: state.homeScreenReducer
    },
    currentLanguage: getActiveLocaleLanguage(state),
    isSoftwareUpdateOpen: getIsSoftwareUpdateOpen(state)
  };
};

const mapDispatchToProps =  {
  closeSoftwareUpdate
};

BodyContainer.propTypes = {
  reducers: PropTypes.object.isRequired,
  currentLanguage: PropTypes.object,
  translate: PropTypes.func,
  isSoftwareUpdateOpen: PropTypes.bool.isRequired,
  closeSoftwareUpdate: PropTypes.func.isRequired
};

export default withLocale(connect(mapStateToProps, mapDispatchToProps)(BodyContainer));
