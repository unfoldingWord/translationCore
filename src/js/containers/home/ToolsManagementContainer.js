import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// components
import ToolsCards from '../../components/home/toolsManagement/ToolsCards';
import HomeContainerContentWrapper from '../../components/home/HomeContainerContentWrapper';
// actions
import * as ToolSelectionActions from '../../actions/ToolSelectionActions';
import * as ToolsMetadataActions from '../../actions/ToolsMetadataActions';
import * as AlertModalActions from '../../actions/AlertModalActions';
import * as ProjectDetailsActions from '../../actions/ProjectDetailsActions';

class ToolsManagementContainer extends Component {

  componentWillMount() {
    this.props.actions.getToolsMetadatas();
  }

  render() {
    const { toolsMetadata } = this.props.reducers.toolsReducer;
    const { loggedInUser } = this.props.reducers.loginReducer;
    const {
      currentSettings: {
        developerMode
      }
    } = this.props.reducers.settingsReducer;
    const {
      manifest,
      projectSaveLocation,
      currentProjectToolsProgress,
      currentProjectToolsSelectedGL
    } = this.props.reducers.projectDetailsReducer;
    const {translate} = this.props;
    const instructions = (<div>{translate('home.tools.select_from_list')}</div>);
    return (
      <HomeContainerContentWrapper translate={translate}
                                   instructions={instructions}>
        <div style={{ height: '100%' }}>
          Tools
          <ToolsCards
            manifest={manifest}
            translate={translate}
            bookName={name}
            loggedInUser={loggedInUser}
            actions={{
              ...this.props.actions,
              launchTool: this.props.actions.launchTool(translate('home.tools.login_required'))
            }}
            developerMode={developerMode}
            toolsMetadata={toolsMetadata}
            projectSaveLocation={projectSaveLocation}
            currentProjectToolsProgress={currentProjectToolsProgress}
            currentProjectToolsSelectedGL={currentProjectToolsSelectedGL}
          />
        </div>
      </HomeContainerContentWrapper>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    reducers: {
      homeScreenReducer: state.homeScreenReducer,
      toolsReducer: state.toolsReducer,
      settingsReducer: state.settingsReducer,
      projectDetailsReducer: state.projectDetailsReducer,
      loginReducer: state.loginReducer
    }
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    actions: {
      getToolsMetadatas: () => {
        dispatch(ToolsMetadataActions.getToolsMetadatas());
      },
      getProjectProgressForTools: (toolName) => {
        dispatch(ProjectDetailsActions.getProjectProgressForTools(toolName));
      },
      setProjectToolGL: (toolName, selectedGL) => {
        dispatch(ProjectDetailsActions.setProjectToolGL(toolName, selectedGL));
      },
      launchTool: (loginMessage) => {
        return (toolFolderPath, loggedInUser, currentToolName) => {
          if (!loggedInUser) {
            dispatch(AlertModalActions.openAlertDialog(loginMessage));
            return;
          }
          dispatch(ToolSelectionActions.selectTool(toolFolderPath, currentToolName));
        };
      }
    }
  };
};

ToolsManagementContainer.propTypes = {
  reducers: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  translate: PropTypes.func.isRequired
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ToolsManagementContainer);
