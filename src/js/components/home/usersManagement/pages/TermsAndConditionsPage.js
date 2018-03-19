import React from 'react';
import PropTypes from 'prop-types';
import { Glyphicon } from 'react-bootstrap';

const TermsAndConditionsPage = ({onBackClick, onFaithClick, onCreativeClick, translate}) => (
  <div>
    <button
      className="btn-second"
      onClick={onBackClick}>
      <Glyphicon glyph="share-alt" style={{transform: 'scaleX(-1)'}}/>&nbsp;
      {translate('buttons.back_button')}
    </button>
    <div style={{
      color: 'black',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <h4 style={{marginTop: '40px'}}><b>Terms and Conditions</b></h4>
      <div>
        <p style={{padding: '15px'}}>
          By continuing, you affirm that you have read and understand the
          terms and conditions and agree to:
        </p>
        <ul style={{marginLeft: '50px', padding: '10px'}}>
          <li>
            Only add content that does not infringe on someone else&apos;s
            copyright.
          </li>
          <br/>
          <li>
            Only add content that does not conflict with the&nbsp;
            <span
              id="faith-link"
              onClick={onFaithClick}
              style={{cursor: 'pointer', textDecoration: 'underline'}}>
              Statement of Faith.
            </span>
          </li>
          <br/>
          <li>
            Release your contributions to the content under a&nbsp;
            <span
              id="creative-link"
              onClick={onCreativeClick}
              style={{cursor: 'pointer', textDecoration: 'underline'}}>
              Creative Commons Attribution-ShareAlike 4.0 International License.
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
  onCreativeClick: PropTypes.func.isRequired
};

export default TermsAndConditionsPage;
