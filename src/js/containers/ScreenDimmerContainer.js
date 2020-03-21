import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const ScreenDimmerConatainer = ({ homeScreenReducer: { dimmedScreen } }) => (
  <div
    id="dimmer"
    style={{
      backgroundColor: '#000000',
      display: dimmedScreen ? 'block' : 'none',
      position: 'fixed',
      opacity: '0.6',
      width: '100%',
      height: '100%',
      top: '0',
      zIndex: '3500',
      userSelect: 'none',
    }}>
  </div>
);

ScreenDimmerConatainer.propTypes = { homeScreenReducer: PropTypes.object.isRequired };


const mapStateToProps = (state) => ({ homeScreenReducer: state.homeScreenReducer });

export default connect(
  mapStateToProps,
)(ScreenDimmerConatainer);
