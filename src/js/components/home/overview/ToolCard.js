// external
import React, { Component } from 'react';
import { Glyphicon } from 'react-bootstrap';
import PropTypes from 'prop-types';
// components
import TemplateCard from '../TemplateCard';
import ToolCardProgress from '../toolsManagement/ToolCardProgress';

class ToolCard extends Component {

  componentWillMount() {
    if(this.props.reducers.toolsReducer.currentToolName) {
      this.props.actions.getProjectProgressForTools(this.props.reducers.toolsReducer.currentToolName);
    }
  }

  /**
  * @description generates the heading for the component
  * @param {function} callback - action for link
  * @return {component} - component returned
  */
  heading(callback) {
    const {translate} = this.props;
    const link = this.content() ? <a onClick={callback}>{translate('home.overview.tool_card.change_tool')}</a> : <a/>;
    return (
      <span>{translate('home.overview.tool_card.current_tool')} {link}</span>
    );
  }

  /**
  * @description generates the content for the component, conditionally empty
  * @return {component} - component returned
  */
  content() {
    let content; // content can be empty to fallback to empty button/message
    const { currentToolTitle, currentToolName } = this.props.reducers.toolsReducer;
    const { currentProjectToolsProgress } = this.props.reducers.projectDetailsReducer;

    if (currentToolTitle) { // once currentToolTitle is there then we can get groupsData
      let progress = currentProjectToolsProgress[currentToolName];
      content = (
        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '-10px 0 -24px 0' }}>
          <div style={{ width: '100px', height: '110px', color: 'lightgray', margin: '-6px 20px 0 -16px', overflow: 'hidden'}}>
            <Glyphicon glyph="check" style={{ fontSize: "120px", margin: '-10px 0 0 -25px'}} />
          </div>
          <div style={{ width: '400px' }}>
            <strong style={{ fontSize: 'x-large' }}>{currentToolTitle}</strong>
            <ToolCardProgress progress={progress} />
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
    const {translate} = this.props;
    const emptyMessage = translate('home.overview.select_tool');
    const emptyButtonLabel = translate('home.overview.tool_card.tool');
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
    );
  }
}

ToolCard.propTypes = {
  reducers: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  translate: PropTypes.func
};

export default ToolCard;
