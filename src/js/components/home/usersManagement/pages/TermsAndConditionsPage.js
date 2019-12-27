import React from 'react';
import PropTypes from 'prop-types';
import { Glyphicon } from 'react-bootstrap';

const TermsAndConditionsPage = ({
  onBackClick, onFaithClick, onCreativeClick, translate,
}) => (
  <div>
    <button
      className="btn-second"
      onClick={onBackClick}>
      <Glyphicon glyph="share-alt" style={{ transform: 'scaleX(-1)' }}/>&nbsp;
      {translate('buttons.back_button')}
    </button>
    <div style={{
      color: 'black',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <h4 style={{ marginTop: '40px' }}><b>{translate('users.terms_and_conditions')}</b></h4>
      <div>
        <p style={{ padding: '15px' }}>
          {translate('users.by_continuing')}
        </p>
        <ul style={{ marginLeft: '50px', padding: '10px' }}>
          <li>
            {translate('users.not_infringe')}
          </li>
          <br/>
          <li>
            {translate('users.not_conflict')}
            {' '}
            <span
              id="faith-link"
              onClick={onFaithClick}
              style={{ cursor: 'pointer', textDecoration: 'underline' }}>
              {translate('users.statement_of_faith')}
            </span>
          </li>
          <br/>
          <li>
            {translate('users.release_contributions')}
            {' '}
            <span
              id="creative-link"
              onClick={onCreativeClick}
              style={{ cursor: 'pointer', textDecoration: 'underline' }}>
              {translate('users.cc_by_sa')}
            </span>
          </li>
        </ul>
      </div>
    </div>
  </div>
);

TermsAndConditionsPage.propTypes = {
  translate: PropTypes.func.isRequired,
  onBackClick: PropTypes.func.isRequired,
  onFaithClick: PropTypes.func.isRequired,
  onCreativeClick: PropTypes.func.isRequired,
};

export default TermsAndConditionsPage;
