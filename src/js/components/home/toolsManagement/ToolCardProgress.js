import React from 'react';
import PropTypes from 'prop-types';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import LinearProgress from 'material-ui/LinearProgress';

const ToolCardProgress = ({ progress }) => {
  if (progress > 1) {
    progress = 1;
  } else if (progress < 0) {
    progress = 0;
  }

  const progressPercent = progress * 100;
  let progressPercentageStr = Math.floor(progressPercent) + '%'; // truncation instead of rounding

  if ((progressPercent > 0) && (progressPercent < 1)) {
    progressPercentageStr = '<1%'; // so we don't show zero when there is some progress
  }

  const strokeColor = 'var(--accent-color-dark)';
  let textColor = '#000';
  let percentagePosition = '50%';

  if (progress >= .25) {
    textColor = '#fff';
    percentagePosition = (progressPercent / 2) + '%';
  }

  const containerStyle = {
    width: 'auto', margin: '18px 10px 10px', height: '20px', border: '2px solid var(--accent-color-dark)', overflow: 'visible',
  };
  return (
    <MuiThemeProvider>
      <div>
        <div style={{
          position:'relative', float:'left', left:percentagePosition, zIndex: 1, color: textColor,
        }}>{progressPercentageStr}</div>
        <LinearProgress
          mode="determinate"
          value={progressPercent}
          color={strokeColor}
          style={containerStyle} />
      </div>
    </MuiThemeProvider>
  );
};

ToolCardProgress.propTypes = { progress: PropTypes.number.isRequired };

export default ToolCardProgress;
