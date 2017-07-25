// external
import React, { Component } from 'react';
import { Glyphicon } from 'react-bootstrap';
import { Line } from 'react-progressbar.js';
import PropTypes from 'prop-types';
// components
import TemplateCard from '../TemplateCard';

class ToolCard extends Component {

  /**
  * @description generates the heading for the component
  * @param {function} callback - action for link
  * @return {component} - component returned
  */
  heading(callback) {
    const link = this.content() ? <a onClick={callback}>Change Tool</a> : <a></a>
    return (
      <span>Current Tool {link}</span>
    );
  }

  /**
  * @description generates the progress percentage
  * @param {object} groupsData - all of the data to calculate percentage from
  * @return {double} - percentage number returned
  */
  progress(groupsData) {
    let percent;
    const groupIds = Object.keys(groupsData);
    let totalChecks = 0, completedChecks = 0;
    // Loop through all checks and tally completed and totals
    groupIds.forEach( groupId => {
      const groupData = groupsData[groupId];
      groupData.forEach( check => {
        totalChecks += 1;
        // checks are considered completed if selections
        completedChecks += (check.selections) ? 1 : 0;
      });
    });
    // calculate percentage by dividing total by completed
    percent = Math.round(completedChecks / totalChecks * 100) / 100;
    return percent;
  }

  /**
  * @description generates a detail for the content
  * @param {string} glyph - name of the glyph to be used
  * @param {string} text - text used for the detail
  * @return {component} - component returned
  */
  progressBar(progress) {
    const options = {
      strokeWidth: 1, easing: 'easeInOut', duration: 1000,
      color: 'var(--accent-color-dark)', trailColor: 'var(--background-color-light)',
      trailWidth: 1, svgStyle: {width: '100%', height: '100%'}
    };
    const containerStyle = { marginTop: '18px', height: '20px', border: '2px solid var(--accent-color-dark)' };
    let progressPercentage = progress * 100 ;

    return (
      <Line
        progress={progress}
        text={ progressPercentage.toFixed() + '%'}
        options={options}
        initialAnimate={true}
        containerStyle={containerStyle}
      />
    );
  }

  /**
  * @description generates the content for the component, conditionally empty
  * @return {component} - component returned
  */
  content() {
    let content; // content can be empty to fallback to empty button/message
    const { currentToolTitle } = this.props.reducers.toolsReducer;

    if (currentToolTitle) { // once currentToolTitle is there then we can get groupsData
      const { groupsData } = this.props.reducers.groupsDataReducer;
      let progress = 0;
      if (groupsData) progress = this.progress(groupsData);
      content = (
        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '-10px 0 -24px 0' }}>
          <div style={{ width: '100px', height: '110px', color: 'lightgray', margin: '-6px 20px 0 -16px', overflow: 'hidden'}}>
            <Glyphicon glyph="check" style={{ fontSize: "120px", margin: '-10px 0 0 -25px'}} />
          </div>
          <div style={{ width: '400px' }}>
            <strong style={{ fontSize: 'x-large' }}>{currentToolTitle}</strong>
            {this.progressBar(progress)}
          </div>
        </div>
      );
    }
    return content;
  }

  /**
  * @description determines if fallback should be disabled
  * @return {bool} - return true/false
  */
  disabled() {
    const { projectSaveLocation } = this.props.reducers.projectDetailsReducer;
    return !projectSaveLocation;
  }

  render() {
    const emptyMessage = 'Select a tool';
    const emptyButtonLabel = 'Tool';
    const emptyButtonOnClick = () => { this.props.actions.goToStep(3) };
    return (
      <TemplateCard
        heading={this.heading(emptyButtonOnClick)}
        content={this.content()}
        emptyMessage={emptyMessage}
        emptyButtonLabel={emptyButtonLabel}
        emptyButtonOnClick={emptyButtonOnClick}
        disabled={this.disabled()}
      />
    )
  }
}

ToolCard.propTypes = {
  reducers: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired
};

export default ToolCard;
