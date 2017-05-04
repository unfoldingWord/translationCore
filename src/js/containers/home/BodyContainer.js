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
        <div>
          {displayHomeView ? (
              <HomeContainer />
            ) : (
              <div>
                <Col className="col-fluid" xs={1} sm={2} md={2} lg={3} style={{ padding: 0, width: "250px" }}>
                  <SideBarContainer />
                </Col>
                <Col id="scrollableSection" xs={7} sm={8} md={9} lg={9.5}>
                  <ToolsContainer />
                </Col>
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
