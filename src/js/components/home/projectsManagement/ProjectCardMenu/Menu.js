import React from 'react';
import PropTypes from 'prop-types';
import Popover from 'material-ui/Popover/Popover';
import { Glyphicon } from 'react-bootstrap';

/**
 * Renders the project menu
 */
class Menu extends React.Component {
  constructor(props) {
    super(props);
    this.handleTouchTap = this.handleTouchTap.bind(this);
    this.handleRequestClose = this.handleRequestClose.bind(this);

    this.state = { open: false };
  }

  handleTouchTap(event) {
    // This prevents ghost click.
    if (event.preventDefault) {
      event.preventDefault();
    }
    this.setState({
      open: true,
      anchorEl: event.currentTarget,
    });
  }

  handleRequestClose() {
    this.setState({ open: false });
  }

  render() {
    const {
      projectSaveLocation,
      translate,
      onArchive,
      onExportCSV,
      onExportUSFM,
      onUpload,
      onEdit,
      onLoadUrl,
      onPrintPreview,
      user,
    } = this.props;
    const menuItemStyle = {
      padding: '4px',
      display: 'flex',
      margin: '4px 4px 0 0',
    };
    const glyphStyle = { fontSize: 'large', margin: '0 14px 0 4px' };
    return (
      <div style={{ cursor: 'pointer' }}>
        <div onClick={this.handleTouchTap}>
          <Glyphicon glyph="option-vertical" style={{ fontSize: 'large' }}/>
        </div>
        <Popover
          className='popover-root'
          style={{ cursor: 'pointer' }}
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          targetOrigin={{ horizontal: 'right', vertical: 'top' }}
          onRequestClose={this.handleRequestClose}
        >
          <div style={{ margin: '4px' }}>
            <div
              style={menuItemStyle}
              onClick={() => {
                this.handleRequestClose();
                onExportUSFM(projectSaveLocation);
              }}
            >
              <Glyphicon glyph='export' style={glyphStyle}/>
              <div>{translate('projects.export_usfm')}</div>
            </div>
            <hr style={{ margin: '4px 0 0 0' }}/>
            <div
              style={menuItemStyle}
              onClick={() => {
                this.handleRequestClose();
                onExportCSV(projectSaveLocation);
              }}
            >
              <Glyphicon glyph='export' style={glyphStyle}/>
              <div>{translate('projects.export_csv')}</div>
            </div>
            <hr style={{ margin: '4px 0 0 0' }}/>
            <div
              style={menuItemStyle}
              onClick={() => {
                this.handleRequestClose();
                onUpload(projectSaveLocation, user);
              }}
            >
              <Glyphicon glyph='cloud-upload' style={glyphStyle}/>
              <div>{translate('projects.upload_to_d43',
                { door43: translate('_.door43') })}</div>
            </div>
            <hr style={{ margin: '4px 0 0 0' }}/>
            <div
              style={menuItemStyle}
              onClick={() => {
                this.handleRequestClose();
                onEdit(projectSaveLocation);
              }}
            >
              <Glyphicon glyph='pencil' style={glyphStyle}/>
              <div>{translate('projects.edit_project_details')}</div>
            </div>
            <hr style={{ margin: '4px 0 0 0' }}/>
            <div
              style={menuItemStyle}
              onClick={() => {
                this.handleRequestClose();
                onArchive(projectSaveLocation);
              }}
            >
              <Glyphicon glyph='folder-close' style={glyphStyle}/>
              <div>{translate('projects.archive')}</div>
            </div>
            <hr style={{ margin: '4px 0 0 0' }}/>
            <div
              style={menuItemStyle}
              onClick={() => {
                this.handleRequestClose();
                onLoadUrl(projectSaveLocation);
              }}
            >
              <Glyphicon glyph='cloud-download' style={glyphStyle}/>
              <div>{translate('projects.load_view_usfm_url')}</div>
            </div>
            <div
              style={menuItemStyle}
              onClick={() => {
                this.handleRequestClose();
                onPrintPreview(projectSaveLocation);
              }}
            >
              <Glyphicon glyph='print' style={glyphStyle}/>
              <div>{'Print Preview'}</div>
            </div>
          </div>
        </Popover>
      </div>
    );
  }
}

Menu.propTypes = {
  translate: PropTypes.func.isRequired,
  projectSaveLocation: PropTypes.string.isRequired,
  user: PropTypes.any.isRequired,
  onEdit: PropTypes.func.isRequired,
  onArchive: PropTypes.func.isRequired,
  onUpload: PropTypes.func.isRequired,
  onExportCSV: PropTypes.func.isRequired,
  onExportUSFM: PropTypes.func.isRequired,
  onLoadUrl: PropTypes.func.isRequired,
  onPrintPreview: PropTypes.func.isRequired,
};

export default Menu;
