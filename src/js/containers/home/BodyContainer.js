import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// containers
import HomeContainer from './HomeContainer';
import GroupMenuContainer from '../GroupMenuContainer';
import ToolsContainer from '../ToolsContainer';

class BodyContainer extends Component {
  render() {
    let { displayHomeView } = this.props.reducers.homeScreenReducer;
    return (
        <div style={{display: 'flex', height: 'calc(100vh - 30px)', width: '100%'}}>
          {displayHomeView ? (
                <HomeContainer />
            ) : (
              <div style={{display: 'flex', flex: 'auto'}}>
                <div style={{ flex: "0 0 250px" }}>
                  <GroupMenuContainer />
                </div>
                <div style={{flex: 'auto', display: 'flex'}}>
                  <ToolsContainer />
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
    }
  };
};

BodyContainer.propTypes = {
  reducers: PropTypes.object.isRequired
}

export default connect(
  mapStateToProps
)(BodyContainer);
