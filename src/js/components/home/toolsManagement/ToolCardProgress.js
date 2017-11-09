import React from 'react';
import PropTypes from 'prop-types';
import { Line } from 'react-progressbar.js';

const ToolCardProgress = ({ progress }) => {
  const progressPercentage = (progress * 100).toFixed() + '%';
  const strokeColor = 'var(--accent-color-dark)';
  let textColor = '#000';
  let textContainerWidth = '100%';
  if(progress >= .25) {
    textColor = '#fff';
    textContainerWidth = progressPercentage;
  }
  const options = {
    strokeWidth: 1, 
    easing: 'easeInOut', 
    duration: 1000,
    color: strokeColor,
    trailColor: 'var(--background-color-light)',
    trailWidth: 1, 
    svgStyle: {width: '100%', height: '100%'},
    text: {
      value: progressPercentage,
      style: {
        color: textColor,
        position: 'absolute',
        top: 0,
        width: textContainerWidth,
        textAlign: 'center',
        marginTop: '-2px'
      }
    }
  };
  const containerStyle = { margin: "18px 10px 10px", height: '20px', border: '2px solid var(--accent-color-dark)' };

  return (
    <Line
      progress={progress}
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