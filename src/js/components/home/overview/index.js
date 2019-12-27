import React, { Component } from 'react';
import PropTypes from 'prop-types';
// components
import { connect } from 'react-redux';
import HomeContainerContentWrapper from '../HomeContainerContentWrapper';
import { getSelectedToolTitle } from '../../../selectors';
import UserCard from './UserCard';
import ProjectCard from './ProjectCard';
import ToolCard from './ToolCard';

class OverviewContainer extends Component {
  constructor(props) {
    super(props);
    this.launchButton = this.launchButton.bind(this);
  }

  /**
   * @description generates the launch button
   * @param {bool} disabled - disable the button
   * @param {String} toolTitle
   * @return {component} - component returned
   */
  launchButton(disabled, toolTitle) {
    const {
      toggleHomeView, openTool, warnOnInvalidations,
    } = this.props.actions;
    const {
      translate,
      selectedCategoriesChanged,
      glSelectedChanged,
    } = this.props;

    const onClick = () => {
      if (selectedCategoriesChanged || glSelectedChanged) {
        openTool(toolTitle);
      } else {
        toggleHomeView(false);
        warnOnInvalidations(toolTitle);
      }
    };

    return (
      <button className='btn-prime'
        disabled={disabled}
        onClick={onClick}>
        {translate('buttons.launch_button')}
      </button>
    );
  }

  render() {
    const { translate } = this.props;
    const { store } = this.context;
    const toolTitle = getSelectedToolTitle(store.getState());
    const launchButtonDisabled = !toolTitle;
    const instructions = (
      <div>
        <p>{translate('welcome_to_tc', { 'app': translate('_.app_name') })}
          <br/>
          {translate('to_get_started')}
        </p>
        <ol>
          <li>{translate('log_in')}</li>
          <li>{translate('select_project')}</li>
          <li>{translate('select_tool')}</li>
          <li>{translate('launch')}</li>
        </ol>
      </div>
    );

    return (
      <HomeContainerContentWrapper instructions={instructions}
        translate={translate}>
        <div style={{
          display: 'flex', flexDirection: 'column', height: '100%',
        }}>
          <UserCard {...this.props} />
          <ProjectCard {...this.props} />
          <ToolCard {...this.props} />
          <div style={{ textAlign: 'center' }}>
            {this.launchButton(launchButtonDisabled, toolTitle)}
          </div>
        </div>
      </HomeContainerContentWrapper>
    );
  }
}

OverviewContainer.propTypes = {
  reducers: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  selectedCategoriesChanged: PropTypes.bool.isRequired,
  translate: PropTypes.func,
  glSelectedChanged: PropTypes.bool.isRequired,
};

OverviewContainer.contextTypes = { store: PropTypes.any };

export default connect()(OverviewContainer);
