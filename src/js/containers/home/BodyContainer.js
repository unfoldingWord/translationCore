import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// containers
import HomeContainer from './HomeContainer';
import GroupMenuContainer from '../GroupMenuContainer';
import ToolsContainer from '../ToolsContainer';
import {getActiveLocaleLanguage} from '../../selectors';

class BodyContainer extends Component {
  render() {
    const {currentLanguage} = this.props;
    let { displayHomeView } = this.props.reducers.homeScreenReducer;
    return (
        <div style={{display: 'flex', height: '100vh', width: '100%'}}>
          {displayHomeView ? (
                <HomeContainer />
            ) : (
              <div style={{display: 'flex', flex: 'auto', height: 'calc(100vh - 30px)'}}>
                <div style={{ flex: "0 0 250px" }}>
                  <GroupMenuContainer />
                </div>
                <div style={{flex: 'auto', display: 'flex'}}>
                  <ToolsContainer currentLanguage={currentLanguage} />
                </div>
              </div>
            )
          }
        </div>
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
  currentLanguage: PropTypes.string
};

export default connect(
  mapStateToProps
)(BodyContainer);
