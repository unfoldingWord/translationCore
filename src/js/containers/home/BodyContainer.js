import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Col } from 'react-bootstrap';
// containers
import HomeContainer from './HomeContainer';
import SideBarContainer from '../SideBarContainer';
import ToolsContainer from '../ToolsContainer';


class BodyContainer extends Component {
  render() {
    let {displayHomeView} = this.props.BodyUIReducer;
    return (
        <div style={{display: 'flex', height: 'calc(100vh - 30px)', width: '100%'}}>
          {displayHomeView ? (
              <div style={{flex: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <HomeContainer />
              </div>
            ) : (
              <div style={{display: 'flex', flex: 'auto'}}>
                <div style={{ flex: "0 0 250px" }}>
                  <SideBarContainer />
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

const mapStateToProps = (state, ownProps) => {
  return {
    BodyUIReducer: state.BodyUIReducer
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    actions: {}
  };
};



export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BodyContainer);
