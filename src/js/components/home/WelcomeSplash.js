import React from 'react';
import PropTypes from 'prop-types';
import { getBuild } from 'tc-electron-env';
import packagefile from '../../../../package.json';
import Logo from '../../../images/TC_Icon.png';

const WelcomeSplash = ({
  toggleWelcomeSplash,
  translate,
}) => (
  <div style={{
    height: '90vh', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
  }}>
    <img height="100px" width="90px" src={Logo} />
    <h3 style={{ fontWeight: 'bold', marginTop: '40px' }}>{translate('welcome_to_tc', { 'app': translate('_.app_name') })}</h3>
    <div style={{ margin: '10px 0 50px', fontSize: '18px' }}>{translate('version', { 'version': `${packagefile.version} (${getBuild()})` })}</div>
    <button
      className="btn-prime"
      onClick={toggleWelcomeSplash}>
      {translate('get_started')}
    </button>
  </div>
);

WelcomeSplash.propTypes = {
  toggleWelcomeSplash: PropTypes.func.isRequired,
  translate: PropTypes.func.isRequired,
};

export default WelcomeSplash;
