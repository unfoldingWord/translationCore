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
  getToolGlOwner,
} from '../../selectors';
// actions
import {
  closeAlertDialog, openAlertDialog, openOptionDialog,
} from '../../actions/AlertModalActions';
import * as ProjectDetailsActions from '../../actions/ProjectDetailsActions';
import { promptUserAboutMissingResource } from '../../actions/SourceContentUpdatesActions';
import * as BodyUIActions from '../../actions/BodyUIActions';
import { warnOnInvalidations, openTool } from '../../actions/ToolActions';
import { DEFAULT_ORIG_LANG_OWNER } from '../../common/constants';
import { getOriginalLangOwner } from '../../helpers/ResourcesHelpers';

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
        const owner = getToolGlOwner(reducers, toolName) || DEFAULT_ORIG_LANG_OWNER;
        this.props.actions.loadCurrentCheckCategories(toolName, projectSaveLocation, currentGatewayLanguage, owner);
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
      originalLanguageBookManifests,
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
            originalLanguageBookManifests={originalLanguageBookManifests}
            projectSaveLocation={projectSaveLocation}
            sourceContentUpdateCount={sourceContentUpdateCount}
          />
        </div>
      </HomeContainerContentWrapper>
    );
  }
}

const getManifests = (state) => {
  const tools = getTools(state);
  const manifests = {};

  for (const tool of tools || []) {
    const toolName = tool.name;
    const glOwner = getToolGlOwner(state, toolName) || DEFAULT_ORIG_LANG_OWNER;
    let manifest = getSourceBookManifest(state, getOriginalLangOwner(glOwner));

    if (!manifest) {
      manifest = getSourceBookManifest(state, DEFAULT_ORIG_LANG_OWNER);
    }
    manifests[toolName] = manifest;
  }

  return manifests;
};

const mapStateToProps = (state) => ({
  isUserLoggedIn: getIsUserLoggedIn(state),
  tools: getTools(state),
  originalLanguageBookManifests: getManifests(state),
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
    loadCurrentCheckCategories: (toolName, projectSaveLocation, currentGatewayLanguage, owner) => {
      dispatch(ProjectDetailsActions.loadCurrentCheckCategories(toolName, projectSaveLocation, currentGatewayLanguage, owner));
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
  originalLanguageBookManifests: PropTypes.object.isRequired,
  onMissingResource: PropTypes.func.isRequired,
  toggleHomeView: PropTypes.func.isRequired,
  sourceContentUpdateCount: PropTypes.number.isRequired,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ToolsManagementContainer);
