import React from 'react';
import PropTypes from 'prop-types';

const Logout = ({translate, username, logoutUser, goToNextStep}) => (
  <div style={{ height: '100%', marginBottom: 0, width: 350, margin: 'auto' }}>
    <p style={{ fontSize: 16, textAlign: 'center' }}>
      {translate('home.users.logged_in_as', {name: username})}
      <br /><br />
      {translate('home.users.what_next')}
    </p>
    <button
      className={"btn-prime"}
      style={{ width: "100%", margin: "40px 0px 10px" }}
      onClick={goToNextStep}>
      {translate('home.users.continue_to_project')}
    </button>
    <button
      className="btn-second"
      style={{ width: "100%", margin: "10px 0px 20px" }}
      onClick={logoutUser}>
      {translate('home.logout')}
    </button>
  </div>
);

Logout.propTypes = {
  translate: PropTypes.func.isRequired,
  username: PropTypes.string,
  goToNextStep: PropTypes.func.isRequired,
  logoutUser: PropTypes.func.isRequired
};

export default Logout;
