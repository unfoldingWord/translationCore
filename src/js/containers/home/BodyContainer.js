import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// containers
import HomeContainer from './HomeContainer';
import ToolContainer from '../ToolContainer';
import { getActiveLocaleLanguage } from '../../selectors';
import { withLocale } from '../Locale';

const styles = {
  display: 'flex',
  height: '100vh',
  width: '100%'
};

class BodyContainer extends Component {
  render () {
    const {currentLanguage, translate} = this.props;
    const {displayHomeView} = this.props.reducers.homeScreenReducer;

    if (displayHomeView) {
      return (
        <div style={styles}>
          <HomeContainer translate={translate}/>
        </div>
      );
    } else {
      return (
        <div style={styles}>
          <ToolContainer currentLanguage={currentLanguage}
                         translate={translate}/>
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
    currentLanguage: getActiveLocaleLanguage(state)
  };
};

BodyContainer.propTypes = {
  reducers: PropTypes.object.isRequired,
  currentLanguage: PropTypes.object,
  translate: PropTypes.func
};

export default withLocale(connect(mapStateToProps)(BodyContainer));
