import React  from 'react';
import PropTypes from 'prop-types';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { FloatingActionButton } from 'material-ui';
import { Glyphicon } from 'react-bootstrap';

const ProjectInstructions = ({translate}) => (
  <MuiThemeProvider>
    <div>
      <p>{translate('home.project.select_from_list')}</p>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <p style={{ margin: 0 }}>{translate('home.project.click_to_import')} </p>

        <FloatingActionButton
          disabled={true}
          disabledColor={"var(--accent-color-dark)"}
          mini={true}
          style={{ margin: "5px", alignSelf: "flex-end", zIndex: "999" }}
        >
          <Glyphicon
            style={{ fontSize: "18px", color: "var(--reverse-color)" }}
            glyph={"menu-hamburger"}
          />
        </FloatingActionButton>
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <p style={{ margin: 0 }}>{translate('home.project.click_to_upload')} </p>
        <div
          style={{ margin: "2px 5px 5px 5px", zIndex: "999", height:35, width:35, display:'flex' }}
        >
          <Glyphicon glyph="option-vertical" style={{ fontSize: "large", color:'black', margin:'auto' }} />
        </div>
      </div>
      <p>{translate('home.project.compatibility', {translation_studio: translate('_.translation_studio')})}</p>
    </div>
  </MuiThemeProvider>
);
ProjectInstructions.propTypes = {
  translate: PropTypes.func.isRequired
};
export default ProjectInstructions;
