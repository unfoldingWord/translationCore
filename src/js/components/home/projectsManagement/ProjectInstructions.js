import React from 'react';
import PropTypes from 'prop-types';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { FloatingActionButton } from 'material-ui';
import { Glyphicon } from 'react-bootstrap';

const ProjectInstructions = ({ translate }) => (
  <MuiThemeProvider>
    <div>
      <p>{translate('projects.select_project_from_list')}</p>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <p style={{ margin: 0 }}>{translate('projects.to_import_project')} </p>

        <FloatingActionButton
          disabled={true}
          disabledColor={'var(--accent-color-dark)'}
          mini={true}
          style={{
            margin: '5px', alignSelf: 'flex-end', zIndex: '999',
          }}
        >
          <Glyphicon
            style={{ fontSize: '18px', color: 'var(--reverse-color)' }}
            glyph={'menu-hamburger'}
          />
        </FloatingActionButton>
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <p style={{ margin: 0 }}>
          {translate('projects.to_export_project')}
          <Glyphicon glyph="option-vertical" style={{
            fontSize: 'large', color:'black', margin:'0px 5px',
          }} />
        </p>
      </div>
      <p>{translate('projects.supported_projects', { tstudio: translate('_.translation_studio') })}</p>
    </div>
  </MuiThemeProvider>
);

ProjectInstructions.propTypes = { translate: PropTypes.func.isRequired };
export default ProjectInstructions;
