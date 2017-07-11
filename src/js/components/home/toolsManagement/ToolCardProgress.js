import React from 'react';
import PropTypes from 'prop-types';
import { Line } from 'react-progressbar.js';

const ToolCardProgress = ({ progress }) => {
  const options = {
    strokeWidth: 1, easing: 'easeInOut', duration: 1000,
    color: 'var(--accent-color-dark)', trailColor: 'var(--background-color-light)',
    trailWidth: 1, svgStyle: {width: '100%', height: '100%'}
  };
  const containerStyle = { margin: "18px 10px 10px", height: '20px', border: '2px solid var(--accent-color-dark)' };
  let progressPercentage = progress * 100 ;

  return (
    <Line
      progress={progress}
      text={progressPercentage.toFixed() + '%'}
      options={options}
      initialAnimate={true}
      containerStyle={containerStyle}
    />
  );
};

ToolCardProgress.propTypes = {
  progress: PropTypes.number.isRequired
};

export default ToolCardProgress;