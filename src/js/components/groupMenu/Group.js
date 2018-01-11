import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import PropTypes from 'prop-types';
import CircularProgress from 'material-ui/CircularProgress';
import { Glyphicon } from 'react-bootstrap';
import * as Style from './Style';

class Group extends React.Component {

  render() {
    let style = this.props.active ? Style.menuItem.heading.current : Style.menuItem.heading.normal;

    let glyphAction = this.props.active ? this.props.actions.groupMenuExpandSubMenu : this.props.openGroup;
    let expandedGlyph = (
      <Glyphicon glyph="chevron-down" style={{ float: 'right', marginTop: '3px' }} onClick={glyphAction.bind(this, false)} />
    );
    let collapsedGlyph = (
      <Glyphicon glyph="chevron-right" style={{ float: 'right', marginTop: '3px' }} onClick={glyphAction.bind(this, true)} />
    );

    const { isSubMenuExpanded } = this.props.groupMenuReducer;
    //"var(--reverse-color)"
    return (
      <MuiThemeProvider>
        <div>
          <div style={style} >
            {this.props.active && isSubMenuExpanded ? expandedGlyph : collapsedGlyph}
            <div onClick={this.props.openGroup} >
              <CircularProgress
                mode="determinate"
                value={this.props.progress * 100}
                thickness={15}
                color={"var(--accent-color-light)"}
                style={{ width: '20px', height: '20px', marginRight: '10px', float: 'left' }}
              />
              {this.props.groupIndex.name}
            </div>
          </div>
          {this.props.active && isSubMenuExpanded ? this.props.getGroupItems(this) : null}
        </div>
      </MuiThemeProvider>
    );
  }

}

Group.propTypes = {
  groupMenuReducer: PropTypes.any.isRequired,
  actions: PropTypes.shape({
    groupMenuExpandSubMenu: PropTypes.func.isRequired
  }),
  openGroup: PropTypes.any.isRequired,
  progress: PropTypes.any.isRequired,
  groupIndex: PropTypes.any.isRequired,
  getGroupItems: PropTypes.func.isRequired,
  active: PropTypes.any.isRequired
};

export default Group;
