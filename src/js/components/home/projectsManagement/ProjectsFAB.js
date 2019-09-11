import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FloatingActionButton } from 'material-ui';
import { Glyphicon } from 'react-bootstrap';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
// components
import CardLabel from './CardLabel';
import SpotlightComponent from './SpotlightComponent';

class ProjectFAB extends Component {
  makeFABButton(buttonsMetadata) {
    return buttonsMetadata.map((metadata, i) => (
      <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
        {
          metadata.buttonLabel ?
            <CardLabel
              action={() => {
                metadata.action();
              }}
              label={metadata.buttonLabel} /> : null
        }
        <FloatingActionButton
          onClick={() => {
            metadata.action();
          }}
          style={{ margin: '5px' }}
          backgroundColor={metadata.buttonColor}>
          <Glyphicon style={{ fontSize: '26px', ...metadata.glyphStyle }} glyph={metadata.glyph} />
        </FloatingActionButton>
      </div>
    ));
  }

  render() {
    const { showFABOptions } = this.props.homeScreenReducer;
    const { translate } = this.props;

    const projectButtonsMetadata = [
      {
        action: () => {
          this.props.actions.selectLocalProject();
        },
        buttonLabel: translate('projects.import_local_project'),
        glyph: 'folder-open',
        buttonColor: 'var(--accent-color-dark)',
      },
      {
        action: () => {
          this.props.actions.openOnlineImportModal();
        },
        buttonLabel: translate('projects.import_online_project'),
        glyph: 'cloud-download',
        buttonColor: 'var(--accent-color-dark)',
      },
    ];

    const closeOptionsButtonMetadata = [
      {
        action: () => this.props.actions.closeProjectsFAB(),
        buttonLabel: translate('buttons.close_button'),
        glyph: 'remove',
        glyphStyle: { color: 'var(--accent-color-dark)' },
        buttonColor: 'var(--reverse-color)',
      },
    ];

    const openOptionsButtonMetadata = [
      {
        action: () => this.props.actions.openProjectsFAB(),
        glyph: 'menu-hamburger',
        glyphStyle: { color: 'var(--reverse-color)' },
        buttonColor: 'var(--accent-color-dark)',
      },
    ];

    return (
      <MuiThemeProvider>
        <div>
          {showFABOptions ?
            <div>
              <SpotlightComponent />
              {this.makeFABButton(projectButtonsMetadata)}
              {this.makeFABButton(closeOptionsButtonMetadata)}
            </div>
            :
            this.makeFABButton(openOptionsButtonMetadata)
          }
        </div>
      </MuiThemeProvider>
    );
  }
}

ProjectFAB.propTypes = {
  translate: PropTypes.func.isRequired,
  homeScreenReducer: PropTypes.any.isRequired,
  actions: PropTypes.shape({
    selectLocalProject: PropTypes.func.isRequired,
    openOnlineImportModal: PropTypes.func.isRequired,
    openProjectsFAB: PropTypes.func.isRequired,
    closeProjectsFAB: PropTypes.func.isRequired,
  }),
};

export default ProjectFAB;
