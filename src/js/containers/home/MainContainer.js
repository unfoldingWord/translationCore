import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-bootstrap';
// components
import Instructions from '../../components/home/instructions/Instructions';
import BackNavigation from '../../components/home/BackNavigation';
// containers
import StepperContainer from './StepperContainer';
import DisplayContainer from './DisplayContainer';
// actions
import * as BodyUIActions from '../../actions/BodyUIActions';
// info
import packagefile from '../../../../package.json';

class MainContainer extends Component {
  render() {
    return (
      <div>
        <StepperContainer {...this.props} />
        <Grid>
          <Row>
            <Col>
              <Instructions {...this.props} />
            </Col>
            <Col>
              <DisplayContainer {...this.props} />
            </Col>
          </Row>
          <Row>
            <BackNavigation {...this.props} />
            <div>traslationCore <span>{packagefile.version}</span> (i)</div>
          </Row>
        </Grid>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    prop: state.prop
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    actions: {
      goToNextStep: () => {
        dispatch(BodyUIActions.goToNextStep());
      },
      goToPrevStep: () => {
        dispatch(BodyUIActions.goToPrevStep());
      }
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MainContainer);
