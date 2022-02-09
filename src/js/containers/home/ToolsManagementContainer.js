import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// components
import ToolsCards from '../../components/home/toolsManagement/ToolsCards';
import HomeContainerContentWrapper from '../../components/home/HomeContainerContentWrapper';
import {
  getTools,
  getIsUserLoggedIn,
  getProjectSaveLocation,
  getProjectBookId,
  getToolGatewayLanguage,
  getSourceBookManifest,
  getSourceContentUpdateCount,
} from '../../selectors';
// actions
import {
  closeAlertDialog, openAlertDialog, openOptionDialog,
} from '../../actions/AlertModalActions';
import * as ProjectDetailsActions from '../../actions/ProjectDetailsActions';
import { promptUserAboutMissingResource } from '../../actions/SourceContentUpdatesActions';
import * as BodyUIActions from '../../actions/BodyUIActions';
import { warnOnInvalidations, openTool } from '../../actions/ToolActions';
import { DEFAULT_OWNER } from '../../common/constants';

class ToolsManagementContainer extends Component {
  constructor(props) {
    super(props);
    this.handleSelectTool = this.handleSelectTool.bind(this);
  }

  componentDidMount() {
    const { tools, reducers } = this.props;
    const projectSaveLocation = getProjectSaveLocation(reducers);
    const bookId = getProjectBookId(reducers);

    if (projectSaveLocation && bookId) {
      tools.forEach(({ name:toolName }) => {
        const currentGatewayLanguage = getToolGatewayLanguage(reducers, toolName);
        this.props.actions.loadCurrentCheckCategories(toolName, projectSaveLocation, currentGatewayLanguage);
      });
    }
  }

  handleSelectTool(toolName) {
    const {
      isUserLoggedIn, openTool, translate, openAlertDialog,
    } = this.props;

    if (isUserLoggedIn) {
      openTool(toolName);
    } else {
      openAlertDialog(translate('please_log_in'));
    }
  }

  render() {
    const {
      tools,
      reducers: {
        loginReducer: { loggedInUser },
        projectDetailsReducer: {
          manifest,
          projectSaveLocation,
          toolsCategories,
        },
      },
      translate,
      originalLanguageBookManifest,
      onMissingResource,
      toggleHomeView,
      sourceContentUpdateCount,
    } = this.props;

    const instructions = (
      <div>
        <p>
          {translate('tools.select_tool_from_list')}
        </p>
        <p>
          {translate('projects.supports_any_book', { app: translate('_.app_name') })}&nbsp;
          {translate(
            'projects.tools_required_resources',
            {
              actions: translate('actions'),
              check_for_content_updates: translate('updates.check_for_content_updates'),
            },
          )}
        </p>
      </div>
    );
    return (
      <HomeContainerContentWrapper
        translate={translate}
        instructions={instructions}
      >
        <div style={{ height: '100%' }}>
          {translate('tools.tools')}
          <ToolsCards
            tools={tools}
            onSelectTool={this.handleSelectTool}
            toolsCategories={toolsCategories}
            manifest={manifest}
            translate={translate}
            loggedInUser={loggedInUser}
            toggleHomeView={toggleHomeView}
            actions={{ ...this.props.actions }}
            onMissingResource={onMissingResource}
            originalLanguageBookManifest={originalLanguageBookManifest}
            projectSaveLocation={projectSaveLocation}
            sourceContentUpdateCount={sourceContentUpdateCount}
          />
        </div>
      </HomeContainerContentWrapper>
    );
  }
}

const mapStateToProps = (state) => ({
  isUserLoggedIn: getIsUserLoggedIn(state),
  tools: getTools(state),
  originalLanguageBookManifest: getSourceBookManifest(state, DEFAULT_OWNER),
  sourceContentUpdateCount: getSourceContentUpdateCount(state),
  reducers: {
    homeScreenReducer: state.homeScreenReducer,
    projectDetailsReducer: state.projectDetailsReducer,
    loginReducer: state.loginReducer,
  },
});

const mapDispatchToProps = (dispatch) => ({
  openTool: name => dispatch(openTool(name)),
  openAlertDialog: message => dispatch(openAlertDialog(message)),
  onMissingResource: (resourceDetails) => dispatch(promptUserAboutMissingResource(resourceDetails)),
  toggleHomeView: (value) => dispatch(BodyUIActions.toggleHomeView(value)),
  actions: {
    openOptionDialog: (...args) => dispatch(openOptionDialog(...args)),
    closeAlertDialog: () => dispatch(closeAlertDialog()),
    loadCurrentCheckCategories: (toolName, projectSaveLocation) => {
      dispatch(ProjectDetailsActions.loadCurrentCheckCategories(toolName, projectSaveLocation));
    },
    getProjectProgressForTools: (toolName, results) => {
      dispatch(ProjectDetailsActions.getProjectProgressForTools(toolName, results));
    },
    setProjectToolGL: (toolName, selectedGL, owner) => {
      dispatch(ProjectDetailsActions.setProjectToolGL(toolName, selectedGL, owner));
    },
    updateCategorySelection: (toolName, isChecked, subcategories) => {
      dispatch(ProjectDetailsActions.updateCategorySelection(toolName, isChecked, subcategories));
    },
    updateSubcategorySelection: (subcategory, toolName, isChecked) => {
      dispatch(ProjectDetailsActions.updateSubcategorySelection(subcategory, toolName, isChecked));
    },
    warnOnInvalidations: (toolName) => {
      dispatch(warnOnInvalidations(toolName));
    },
  },
});

ToolsManagementContainer.propTypes = {
  isUserLoggedIn: PropTypes.bool.isRequired,
  openTool: PropTypes.func.isRequired,
  openAlertDialog: PropTypes.func.isRequired,
  tools: PropTypes.array.isRequired,
  reducers: PropTypes.shape({
    projectDetailsReducer: PropTypes.object.isRequired,
    loginReducer: PropTypes.shape({ loggedInUser: PropTypes.bool }).isRequired,
  }).isRequired,
  actions: PropTypes.object.isRequired,
  translate: PropTypes.func.isRequired,
  originalLanguageBookManifest: PropTypes.object.isRequired,
  onMissingResource: PropTypes.func.isRequired,
  toggleHomeView: PropTypes.func.isRequired,
  sourceContentUpdateCount: PropTypes.number.isRequired,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ToolsManagementContainer);
