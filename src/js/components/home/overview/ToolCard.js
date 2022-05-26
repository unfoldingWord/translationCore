import React, { Component } from 'react';
import { Glyphicon } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// components
import TemplateCard from '../TemplateCard';
import ToolCardProgress from '../toolsManagement/ToolCardProgress';
import {
  getSelectedTool,
  getCurrentToolName,
  getProjectToolProgress,
} from '../../../selectors';

class ToolCard extends Component {
  constructor(props) {
    super(props);
    this.content = this.content.bind(this);
  }

  UNSAFE_componentWillMount() {
    const { store } = this.context;
    const currentToolName = getCurrentToolName(store.getState());

    if (currentToolName) {
      this.props.actions.getProjectProgressForTools(currentToolName);
    }
  }

  heading(callback) {
    const { translate } = this.props;
    const link = this.content() ? <a onClick={callback}>{translate('change_tool')}</a> : <a/>;
    return (
      <span>{translate('current_tool')} {link}</span>
    );
  }

  content() {
    const { store } = this.context;
    const state = store.getState();
    const tool = getSelectedTool(state);
    let content; // content can be empty to fallback to empty button/message
    let progress = 0;

    if (tool && tool.name) {
      progress = getProjectToolProgress(state, tool.name);
      content = (
        <div style={{
          display: 'flex', justifyContent: 'space-between', margin: '-10px 0 -24px 0',
        }}>
          <div style={{
            width: '100px', height: '110px', color: 'lightgray', margin: '-6px 20px 0 -16px', overflow: 'hidden',
          }}>
            <Glyphicon glyph="check" style={{ fontSize: '120px', margin: '-10px 0 0 -25px' }} />
          </div>
          <div style={{ width: '400px' }}>
            <strong style={{ fontSize: 'x-large' }}>{tool.title}</strong>
            <ToolCardProgress progress={progress} />
          </div>
        </div>
      );
    }
    return content;
  }

  disabled() {
    const { projectSaveLocation } = this.props.reducers.projectDetailsReducer;
    return !projectSaveLocation;
  }

  render() {
    const { translate } = this.props;
    const emptyMessage = translate('select_tool');
    const emptyButtonLabel = translate('buttons.tool_button');

    const emptyButtonOnClick = () => {
      this.props.actions.goToStep(3);
    };
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
  translate: PropTypes.func,
};
ToolCard.contextTypes = { store: PropTypes.any };

export default connect()(ToolCard);
