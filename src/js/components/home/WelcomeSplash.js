import React from 'react';
import PropTypes from 'prop-types';
import packagefile from '../../../../package.json';

const WelcomeSplash = ({
  actions: {
    toggleWelcomeSplash
  }
}) => {
  return (
    <div style={{height: '90vh', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
      <img height="100px" width="90px" src="./images/TC_Icon.png" />
      <h3 style={{fontWeight: "bold", marginTop: "40px"}}>Welcome to translationCore!</h3>
      <div style={{margin: "10px 0 50px", fontSize: "18px"}}>Version <span>{packagefile.version}</span></div>
      <button
        className="btn-prime"
        onClick={toggleWelcomeSplash}>
        Get Started!
      </button>
    </div>
  );
}

WelcomeSplash.propTypes = {
  reducers: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired
};

export default WelcomeSplash;
