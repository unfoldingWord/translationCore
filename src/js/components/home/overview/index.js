import React, { Component } from 'react';
import PropTypes from 'prop-types';
// components
import UserCard from './UserCard';
import ProjectCard from './ProjectCard';
import ToolCard from './ToolCard';
import {withLocale} from '../../Locale';

@withLocale
export default class Overview extends Component {

  /**
  * @description generates the instructions to show in instructions area
  * @return {component} - component returned
  */
  instructions() {
    const {translate} = this.props;
    return (
      <div>
        <p>{translate('greeting', { 'app': translate('appName')})}</p>
        <ol>
          <li>{translate('login')}</li>
          <li>{translate('select_project')}</li>
          <li>{translate('select_tool')}</li>
          <li>{translate('launch')}</li>
        </ol>
      </div>
    );
  }

  componentWillMount() {
    // update instructions if they don't match current instructions
    if (this.props.reducers.homeScreenReducer.homeInstructions !== this.instructions()) {
      this.props.actions.changeHomeInstructions(this.instructions());
    }
  }

  /**
  * @description generates the launch button
  * @param {bool} disabled - disable the button
  * @return {component} - component returned
  */
  launchButton(disabled) {
    const _this = this;
    const {translate} = this.props;
    const callback = () => { _this.props.actions.toggleHomeView() };
    return (
      <button className='btn-prime' disabled={disabled} onClick={callback}>
        {translate('launch')}
      </button>
    );
  }

  render() {
    const { currentToolTitle } = this.props.reducers.toolsReducer;
    const launchButtonDisabled = !currentToolTitle;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <UserCard {...this.props} />
        <ProjectCard {...this.props} />
        <ToolCard {...this.props} />
        <div style={{ textAlign: 'center' }}>
          {this.launchButton(launchButtonDisabled)}
        </div>
      </div>
    );
  }
}

Overview.propTypes = {
  reducers: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  translate: PropTypes.func
};
