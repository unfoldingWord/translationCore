import React, { useState } from 'react';
import PropTypes from 'prop-types';
// components
import FeedbackDialogContainer from '../FeedbackDialogContainer';
import TcIcon from '../../../images/TC_Icon.png';

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    margin: '40px',
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '50px',
  },
  logo: { margin: '0px 30px 0px 0px' },
  text: { margin: '0px' },
};

function CriticalError({ translate, returnHome }) {
  const [isDialogOpen, toggleDialog] = useState(false);

  return (
    <div style={styles.root}>
      <div style={styles.content}>
        <img
          src={TcIcon}
          style={styles.logo}
          width="130px"
        />
        <h4 style={styles.text}>
          {translate('critical_error_warning')}
        </h4>
      </div>
      <div>
        <button
          key={'feedback_button' + 1}
          label={translate('buttons.feedback_button')}
          className="btn-second"
          onClick={() => toggleDialog(!isDialogOpen)}
        >
          {translate('buttons.feedback_button')}
        </button>
        <button
          key={'go_to_project_button' + 1}
          label={translate('buttons.go_to_project_button')}
          className="btn-prime"
          onClick={returnHome}
        >
          {translate('buttons.go_to_project_button')}
        </button>
      </div>
      <FeedbackDialogContainer
        open={isDialogOpen}
        translate={translate}
        onClose={() => toggleDialog(!isDialogOpen)}
      />
    </div>
  );
}

CriticalError.propTypes = {
  translate: PropTypes.func.isRequired,
  returnHome: PropTypes.func.isRequired,
};

export default CriticalError;
