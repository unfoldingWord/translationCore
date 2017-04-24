import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Col } from 'react-bootstrap';
import RootStyles from '../pages/RootStyle';
// containers
import HomeContainer from './home/HomeContainer';
import SideBarContainer from './SideBarContainer';
import ModuleWrapperContainer from './ModuleWrapperContainer';


class BodyContainer extends Component {

  displayScreen() {
    let {displayHomeView} = this.props.BodyUIReducer;
    let display = <div/>
    if (displayHomeView) {
      display = <HomeContainer />
    } else {
      display = (
        <div>
          <Col className="col-fluid" xs={1} sm={2} md={2} lg={3} style={{ padding: 0, width: "250px" }}>
            <SideBarContainer />
          </Col>
          <Col style={RootStyles.ScrollableSection} xs={7} sm={8} md={9} lg={9.5}>
            <ModuleWrapperContainer />
          </Col>
        </div>
      );
    }
    return display;
  }

  render() {
    return (
      <div>
         {this.displayScreen()}
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    BodyUIReducer: state.BodyUIReducer
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
  };
};



export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BodyContainer)
