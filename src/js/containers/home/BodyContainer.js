import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
// containers
import HomeContainer from './HomeContainer';
import ToolsContainer from '../ToolsContainer';
import {getActiveLocaleLanguage} from '../../selectors';
import {withLocale} from '../Locale';

class BodyContainer extends Component {
  render() {
    const {currentLanguage, translate} = this.props;
    const {displayHomeView} = this.props.reducers.homeScreenReducer;

    return displayHomeView ? (
      <HomeContainer translate={translate} />
    ) : (
        <div style={{maxHeight: 'calc(100vh - 30px)'}} >
          <ToolsContainer currentLanguage={currentLanguage} />
        </div >
      );
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
