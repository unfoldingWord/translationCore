import React from 'react';
import PropTypes from 'prop-types';
import fs from 'fs-extra';
import path from 'path-extra';
import {Card, CardText} from 'material-ui';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
// components
import ToolCard from './ToolCard';
// helpers
import {getTsvOLVersion} from '../../../helpers/originalLanguageResourcesHelpers';
import {getAvailableCategories} from '../../../helpers/ResourcesHelpers';
// constants
import {USER_RESOURCES_PATH, TRANSLATION_NOTES} from '../../../common/constants';
import {isEqual} from 'lodash';

class ToolsCards extends React.Component {
  shouldComponentUpdate(nextProps) {
    const {tools, bookName, loggedInUser, projectSaveLocation, currentProjectToolsSelectedGL,
      manifest, invalidatedReducer, toolsCategories, originalLanguageBookManifest
    } = this.props;
    if (!isEqual(nextProps.bookName, bookName)) {
      console.log('Updating because bookName is different');
      return true;
    } 
    if (!isEqual(nextProps.tools, tools)) {
      console.log('Updating because tools is different');
      return true;
    }
    if (!isEqual(nextProps.loggedInUser, loggedInUser)) {
      console.log('Updating because loggedInUser is different');
      return true;
    } 
    if (!isEqual(nextProps.projectSaveLocation, projectSaveLocation)) {
      console.log('Updating because projectSaveLocation is different');
      return true;
    } 
    if (!isEqual(nextProps.manifest, manifest)) {
      console.log('Updating because manifest is different');
      return true;
    } 
    if (!isEqual(nextProps.invalidatedReducer, invalidatedReducer)) {
      console.log('Updating because invalidatedReducer is different');
      return true;
    } 
    if (!isEqual(nextProps.toolsCategories, toolsCategories)) {
            console.log('Updating because toolsCategories is different');
      return true;
    } 
    if (!isEqual(nextProps.originalLanguageBookManifest, originalLanguageBookManifest)) {
      console.log('Updating because originalLanguageBookManifest is different');
      return true;
    } 
    if (!isEqual(nextProps.currentProjectToolsSelectedGL, currentProjectToolsSelectedGL)) {
      console.log('Updating because currentProjectToolsSelectedGL is different');
      return true;
    } 
    else return false;
  }
  render() {
    const {
      tools,
      actions,
      translate,
      onSelectTool,
      bookName,
      loggedInUser,
      projectSaveLocation,
      manifest,
      invalidatedReducer,
      toolsCategories,
      originalLanguageBookManifest,
      currentProjectToolsSelectedGL,
      onMissingResource,
      toggleHomeView,
    } = this.props;
    if (!tools || tools.length === 0) {
      return (
        <MuiThemeProvider>
          <Card style={{display: "flex", justifyContent: "center", alignItems: "center", margin: "6px 0px 10px", height: "200px"}}>
            <CardText style={{fontWeight: "bold"}}>
              {translate('tools.no_tools', {app: translate('_.app_name')})}
            </CardText>
          </Card>
        </MuiThemeProvider>
      );
    } else if (bookName.length === 0 && projectSaveLocation === 0) {
      return (
        <MuiThemeProvider>
          <Card style={{display: "flex", justifyContent: "center", alignItems: "center", margin: "6px 0px 10px", height: "200px"}}>
            <CardText style={{fontWeight: "bold"}}>
              {translate('projects.no_project')}
              <span
                style={{color: "var(--accent-color-dark)", cursor: "pointer"}}
                onClick={() => this.props.actions.goToStep(2)}
              >
                &nbsp;{translate('select_project')}&nbsp;
            </span>
            </CardText>
          </Card>
        </MuiThemeProvider>
      );
    } else {
      return (
        <div style={{height: '100%', overflowY: 'auto', paddingRight: '10px'}}>
          {
            tools.map((tool, i) => {
              const availableCategories = getAvailableCategories(currentProjectToolsSelectedGL[tool.name], tool.name, projectSaveLocation, {withCategoryName: true});
              let isOLBookVersionMissing = false;
              let missingOLResource = {};
              if (tool.name === TRANSLATION_NOTES) {
                const {
                  language_id: languageId,
                  resource_id: resourceId
                } = originalLanguageBookManifest;
                const {tsv_relation} = manifest;
                const tsvOLVersion = getTsvOLVersion(tsv_relation, resourceId);
                const neededOLPath = path.join(USER_RESOURCES_PATH, languageId, 'bibles', resourceId, 'v' + tsvOLVersion);
                if (neededOLPath) isOLBookVersionMissing = tsvOLVersion && !fs.existsSync(neededOLPath);
                missingOLResource = {
                  languageId,
                  resourceId,
                  version: tsvOLVersion,
                };
              }

              return (
                <ToolCard
                  key={i}
                  tool={tool}
                  onSelect={onSelectTool}
                  toggleHomeView={toggleHomeView}
                  availableCategories={availableCategories}
                  selectedCategories={toolsCategories[tool.name] || []}
                  translate={translate}
                  actions={actions}
                  loggedInUser={loggedInUser}
                  metadata={{
                    title: tool.title,
                    version: tool.version,
                    description: tool.description,
                    badgeImagePath: tool.badge,
                    folderName: tool.path,
                    name: tool.name
                  }}
                  currentSelectedGL={currentProjectToolsSelectedGL[tool.name] || ''}
                  isOLBookVersionMissing={!!isOLBookVersionMissing}
                  onMissingResource={() => onMissingResource(missingOLResource)}
                  invalidatedReducer={invalidatedReducer}
                />
              );
            })
          }
        </div>
      );
    }
  }
}

ToolsCards.propTypes = {
  tools: PropTypes.array,
  onSelectTool: PropTypes.func.isRequired,
  translate: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired,
  bookName: PropTypes.string.isRequired,
  loggedInUser: PropTypes.bool.isRequired,
  projectSaveLocation: PropTypes.string.isRequired,
  manifest: PropTypes.object.isRequired,
  invalidatedReducer: PropTypes.object.isRequired,
  toolsCategories: PropTypes.object.isRequired,
  originalLanguageBookManifest: PropTypes.object.isRequired,
  onMissingResource: PropTypes.func.isRequired,
  toggleHomeView: PropTypes.func.isRequired,
  currentProjectToolsSelectedGL: PropTypes.object.isRequired,
};

export default ToolsCards;
