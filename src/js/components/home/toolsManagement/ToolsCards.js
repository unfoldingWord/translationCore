import React from 'react';
import PropTypes from 'prop-types';
import fs from 'fs-extra';
import path from 'path-extra';
import { Card, CardText } from 'material-ui';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
// components
import ToolCard from './ToolCard';
// helpers
import {getTsvOLVersion} from '../../../helpers/originalLanguageResourcesHelpers';
import {getAvailableCategories} from '../../../helpers/ResourcesHelpers';
// constants
import { USER_RESOURCES_PATH } from '../../../common/constants';

/**
 * Renders a list of tools.
 * TODO: rename this to ToolsList and make it a self contained container with supporting components
 * @param tools
 * @param actions
 * @param translate
 * @param bookName
 * @param loggedInUser
 * @param projectSaveLocation
 * @param currentProjectToolsProgress
 * @param manifest
 * @param invalidatedReducer
 * @param toolsCategories
 * @returns {*}
 * @constructor
 */
const ToolsCards = ({
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
}) => {
  if (!tools || tools.length === 0) {
    return (
      <MuiThemeProvider>
        <Card style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "6px 0px 10px", height: "200px" }}>
          <CardText style={{ fontWeight: "bold" }}>
            {translate('tools.no_tools', {app: translate('_.app_name')})}
          </CardText>
        </Card>
      </MuiThemeProvider>
    );
  } else if (bookName.length === 0 && projectSaveLocation === 0) {
    return (
      <MuiThemeProvider>
        <Card style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "6px 0px 10px", height: "200px" }}>
          <CardText style={{ fontWeight: "bold" }}>
            {translate('projects.no_project')}
            <span
              style={{ color: "var(--accent-color-dark)", cursor: "pointer" }}
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
      <div style={{ height: '100%', overflowY: 'auto', paddingRight: '10px' }}>
        {
          tools.map((tool, i) => {
            const availableCategories = getAvailableCategories(currentProjectToolsSelectedGL[tool.name], tool.name, projectSaveLocation);
            let isOLBookVersionMissing = false;
            let missingOLResource = {};
            if (tool.name === 'translationNotes') {
              const {
                language_id: languageId,
                resource_id: resourceId
              } = originalLanguageBookManifest;
              const { tsv_relation } = manifest;
              const tsvOLVersion = getTsvOLVersion(tsv_relation, resourceId);
              const neededOLPath = path.join(USER_RESOURCES_PATH, languageId, 'bibles', resourceId, 'v' + tsvOLVersion);
              isOLBookVersionMissing = !fs.existsSync(neededOLPath);
              missingOLResource = {
                languageId,
                resourceId,
                version: tsvOLVersion,
              };
            }

            return (
              <ToolCard
                tool={tool}
                onSelect={onSelectTool}
                availableCategories={availableCategories}
                selectedCategories={toolsCategories[tool.name] || []}
                translate={translate}
                key={i}
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
                isOLBookVersionMissing={isOLBookVersionMissing}
                onMissingResource={() => onMissingResource(missingOLResource)}
                invalidatedReducer={invalidatedReducer}
              />
            );
          })
        }
      </div>
    );
  }
};

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
};

export default ToolsCards;
