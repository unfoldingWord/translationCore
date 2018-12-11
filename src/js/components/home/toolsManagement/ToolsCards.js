import React from 'react';
import PropTypes from 'prop-types';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
// components
import ToolCard from './ToolCard';
import { Card, CardText } from 'material-ui';

/**
 * Renders a list of tools.
 * TODO: rename this to ToolsList and make it a self contained container with supporting components
 * @param tools
 * @param actions
 * @param translate
 * @param bookName
 * @param projectPath
 * @param onGoBack
 * @param onSelectTool
 * @param selectedCategories
 * @param availableCategories
 * @returns {*}
 * @constructor
 */
const ToolsCards = ({
  tools,
  actions,
  translate,
  bookName,
  projectPath,
  onGoBack,
  onSelectTool,
  selectedCategories,
  availableCategories
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
  } else if (bookName.length === 0 && projectPath === 0) {
    return (
      <MuiThemeProvider>
        <Card style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "6px 0px 10px", height: "200px" }}>
          <CardText style={{ fontWeight: "bold" }}>
            {translate('projects.no_project')}
            <span
              style={{ color: "var(--accent-color-dark)", cursor: "pointer" }}
              onClick={onGoBack}
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
            return (
              <ToolCard
                availableCategories={availableCategories[tool.name] || []}
                selectedCategories={selectedCategories}
                translate={translate}
                key={i}
                tool={tool}
                onSelect={onSelectTool}
                actions={actions}
              />
            );
          })
        }
      </div>
    );
  }
};

ToolsCards.propTypes = {
  onGoBack: PropTypes.func.isRequired,
  tools: PropTypes.array,
  onSelectTool: PropTypes.func.isRequired,
  translate: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired,
  bookName: PropTypes.string.isRequired,
  projectPath: PropTypes.string.isRequired,
  selectedCategories: PropTypes.array.isRequired,
  availableCategories: PropTypes.object.isRequired,
};

export default ToolsCards;
