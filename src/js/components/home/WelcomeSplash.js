import React from 'react';
import PropTypes from 'prop-types';
import packagefile from '../../../../package.json';

const WelcomeSplash = ({
  actions: {
    toggleWelcomeSplash
  },
  translate
}) => (
  <div style={{height: '90vh', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
    <img height="100px" width="90px" src="./images/TC_Icon.png" />
    <h3 style={{fontWeight: "bold", marginTop: "40px"}}>splash {translate('home.welcome_to_app', {'app': translate('_.app_name')})}</h3>
    <div style={{margin: "10px 0 50px", fontSize: "18px"}}>{translate('home.version', {'version': packagefile.version})}</div>
    <button
      className="btn-prime"
      onClick={toggleWelcomeSplash}>
      {translate('home.get_started')}
    </button>
  </div>
);

WelcomeSplash.propTypes = {
  reducers: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  translate: PropTypes.func.isRequired
};

export default WelcomeSplash;
