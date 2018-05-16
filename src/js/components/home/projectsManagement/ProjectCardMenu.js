import React from 'react';
import PropTypes from 'prop-types';
import Popover from 'material-ui/Popover/Popover';
import { Glyphicon } from 'react-bootstrap';
import ReimportProjectIcon from '../../svgIcons/ReimportProjectIcon';

// components

class ProjectCardMenu extends React.Component {

  constructor (props) {
    super(props);

    this.state = {
      open: false
    };
  }

  handleTouchTap (event) {
    // This prevents ghost click.
    if (event.preventDefault)
      event.preventDefault();
    this.setState({
      open: true,
      anchorEl: event.currentTarget
    });
  }

  handleRequestClose () {
    this.setState({
      open: false
    });
  }

  render () {
    const {projectSaveLocation, translate} = this.props;
    const menuItemStyle = {
      padding: '4px',
      display: 'flex',
      margin: '4px 4px 0 0'
    };
    const glyphStyle = {fontSize: 'large', margin: '0 14px 0 4px'};
    return (
      <div style={{cursor: 'pointer'}}>
        <div onTouchTap={(e) => { this.handleTouchTap(e) }}>
          <Glyphicon glyph="option-vertical" style={{fontSize: 'large'}}/>
        </div>
        <Popover
          className='popover-root'
          style={{cursor: 'pointer'}}
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
          targetOrigin={{horizontal: 'right', vertical: 'top'}}
          onRequestClose={() => { this.handleRequestClose() }}
        >
          <div style={{margin: '4px'}}>
            <div
              style={menuItemStyle}
              onClick={() => {
                this.handleRequestClose();
                this.props.actions.exportToUSFM(projectSaveLocation);
                }}
            >
              <Glyphicon glyph='export' style={glyphStyle}/>
              <div>{translate('projects.export_usfm')}</div>
            </div>
            <hr style={{margin: '4px 0 0 0'}}/>
            <div
              style={menuItemStyle}
              onClick={() => {
                this.handleRequestClose();
                this.props.actions.exportToCSV(projectSaveLocation);
              }}
            >
              <Glyphicon glyph='export' style={glyphStyle}/>
              <div>{translate('projects.export_csv')}</div>
            </div>
            <hr style={{margin: '4px 0 0 0'}}/>
            <div
              style={menuItemStyle}
              onClick={() => {
                this.handleRequestClose();
                this.props.actions.uploadProject(projectSaveLocation,
                  this.props.user);
              }}
            >
              <Glyphicon glyph='cloud-upload' style={glyphStyle}/>
              <div>{translate('projects.upload_to_d43', {door43: translate('_.door43')})}</div>
            </div>
            <hr style={{margin: '4px 0 0 0'}}/>
            <div
              style={menuItemStyle}
              onClick={() => {
                this.handleRequestClose();
                this.props.actions.openOnlyProjectDetailsScreen(
                  projectSaveLocation);
              }}
            >
              <Glyphicon glyph='pencil' style={glyphStyle}/>
              <div>{translate('projects.edit_project_details')}</div>
            </div>
            <hr style={{margin: '4px 0 0 0'}}/>
            <div
              style={menuItemStyle}
              onClick={() => {
                this.handleRequestClose();
                this.props.actions.reimportLocalProject(projectSaveLocation);
              }}
            >
              <div style={{margin: '0px 14px 0px 4px'}}>
                <ReimportProjectIcon width={20} height={20} color="rgba(0, 0, 0, 0.87)" />
              </div>
              <div>{translate('projects.reimport_project')}</div>
            </div>
          </div>
        </Popover>
      </div>
    );
  }
}

ProjectCardMenu.propTypes = {
  translate: PropTypes.func.isRequired,
  projectSaveLocation: PropTypes.string.isRequired,
  actions: PropTypes.object.isRequired,
  user: PropTypes.any.isRequired
};

export default ProjectCardMenu;
