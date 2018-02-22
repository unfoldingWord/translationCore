import React from 'react';
import PropTypes from 'prop-types';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
// components
import ToolCard from './ToolCard';
import { Card, CardText } from 'material-ui';

const ToolsCards = ({
  actions,
  translate,
  bookName,
  loggedInUser,
  toolsMetadata,
  projectSaveLocation,
  currentProjectToolsProgress,
  currentProjectToolsSelectedGL
}) => {
  if (toolsMetadata.length == 0 || !toolsMetadata) {
    return (
      <MuiThemeProvider>
        <Card style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "6px 0px 10px", height: "200px" }}>
          <CardText style={{ fontWeight: "bold" }}>
            {translate('home.tools.no_tools', {app: translate('_.app_name')})}
          </CardText>
        </Card>
      </MuiThemeProvider>
    );
  } else if (bookName.length == 0 && projectSaveLocation == 0) {
    return (
      <MuiThemeProvider>
        <Card style={{ display: "flex", justifyContent: "center", alignItems: "center", margin: "6px 0px 10px", height: "200px" }}>
          <CardText style={{ fontWeight: "bold" }}>
            {translate('home.tools.no_project')}
            <span
              style={{ color: "var(--accent-color-dark)", cursor: "pointer" }}
              onClick={() => this.props.actions.goToStep(2)}
            >
              &nbsp;{translate('home.overview.select_project')}&nbsp;
            </span>
          </CardText>
        </Card>
      </MuiThemeProvider>
    );
  } else {
    return (
      <div style={{ height: '100%', overflowY: 'auto', paddingRight: '10px' }}>
        {
          toolsMetadata.map((metadata, i) => {
            return (
              <ToolCard
                translate={translate}
                key={i}
                actions={actions}
                loggedInUser={loggedInUser}
                metadata={metadata}
                currentProjectToolsProgress={currentProjectToolsProgress}
                currentProjectToolsSelectedGL={currentProjectToolsSelectedGL}
              />
            );
          })
        }
      </div>
    );
  }
};

ToolsCards.propTypes = {
  translate: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired,
  bookName: PropTypes.string.isRequired,
  loggedInUser: PropTypes.bool.isRequired,
  toolsMetadata: PropTypes.array.isRequired,
  projectSaveLocation: PropTypes.string.isRequired,
  currentProjectToolsProgress: PropTypes.object.isRequired,
  currentProjectToolsSelectedGL: PropTypes.object.isRequired
};

export default ToolsCards;
