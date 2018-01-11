import React from 'react';
import PropTypes from 'prop-types';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import LinearProgress from 'material-ui/LinearProgress';

const ToolCardProgress = ({ progress }) => {
  if (progress > 1)
    progress = 1;
  else if (progress < 0)
    progress = 0;
  //const progressPercentage = (progress * 100).toFixed() + '%';
  const strokeColor = 'var(--accent-color-dark)';
  // let textColor = '#000';
  // let textContainerWidth = '100%';
  // if(progress >= .25) {
  //   textColor = '#fff';
  //   textContainerWidth = progressPercentage;
  // }
  const containerStyle = { margin: "18px 10px 10px", height: '20px', border: '2px solid var(--accent-color-dark)' };
  //text = progressPercentage
  return (
    <MuiThemeProvider>
      <LinearProgress
        mode="determinate"
        value={progress * 100}
        color={strokeColor}
        style={containerStyle}
      />
    </MuiThemeProvider>
  );
};

ToolCardProgress.propTypes = {
  progress: PropTypes.number.isRequired
};

export default ToolCardProgress;