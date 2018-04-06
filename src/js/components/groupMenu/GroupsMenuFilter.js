import React from 'react';
import PropTypes from 'prop-types';
import { Glyphicon } from 'react-bootstrap';
import InvalidatedIcon from '../svgIcons/InvalidatedIcon';

class GroupsMenuFilter extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      showInvalidated: true,
      showBookmarks: true,
      showSelections: true,
      showNoSelections: true,
      showVerseEdits: true,
      showComments: true
    };
  }

  handleCheckboxSelection(event) {
    const target = event.target;
    const value = target.checked;
    const name = target.name;
    this.setState({
      [name]: value
    });
    console.log(this.state);
    console.log(event);
  }

  render() {
    const styles = {
      color: "var(--reverse-color)",
      width: this.props.menuFilterWidth
    };

    return (
      <div id="groups-menu-filter" style={styles}>
        <div id="groups-menu-filter-top">
          <span id="groups-menu-title">Menu</span><Glyphicon key="filter" glyph="filter"/>
        </div>
        <div id="groups-menu-filter-options">
          <div className="option">
            <span className="object-checkbox"><input type="checkbox" name="showInvalidated" checked={this.state.showInvalidated} onChange={this.handleCheckboxSelection.bind(this)} /></span>
            <span className="object-icon"><InvalidatedIcon width={16} height={16} color="#fff"/></span>
            <span className="object-text">Invalidated</span>
          </div>
          <div className="option">
            <span className="option-checkbox"><input type="checkbox" name="showBookmarks" checked={this.state.showBookmarks} onChange={this.handleCheckboxSelection.bind(this)} /></span>
            <span className="option-icon"><Glyphicon glyph="bookmark"/></span>
            <span className="option-text">Bookmarks</span>
          </div>
          <div className="option">
            <span className="option-checkbox"><input type="checkbox" name="showSelections" checked={this.state.showSelections} onChange={this.handleCheckboxSelection.bind(this)} /></span>
            <span className="option-icon"><Glyphicon glyph="ok"/></span>
            <span className="option-text">Selected</span>
          </div>
          <div className="option">
            <span className="option-checkbox"><input type="checkbox" name="showNoSelections" checked={this.state.showNoSelections} onChange={this.handleCheckboxSelection.bind(this)} /></span>
            <span className="option-checkbox"><Glyphicon glyph="ban-circle"/></span>
            <span className="option-text">No Selection</span>
          </div>
          <div className="option">
            <span className="option-checkbox"><input type="checkbox" name="showVerseEdits" checked={this.state.showVerseEdits} onChange={this.handleCheckboxSelection.bind(this)} /></span>
            <span className="option-checkbox"><Glyphicon glyph="pencil"/></span>
            <span className="option-text">Verse edit</span>
          </div>
          <div className="option">
            <span className="option-checkbox"><input type="checkbox" name="showComments" checked={this.state.showComments} onChange={this.handleCheckboxSelection.bind(this)} /></span>
            <span className="option-checkbox"><Glyphicon glyph="comment"/></span>
            <span className="option-text">Comments</span>
          </div>
        </div>
      </div>
    );
  }
}

GroupsMenuFilter.defaultProps = {
  menuFilterWidth: '100%'
}

GroupsMenuFilter.propTypes = {
  currentToolName: PropTypes.string.isRequired,
  translate: PropTypes.func.isRequired,
  menuFilterWidth: PropTypes.any
};

export default GroupsMenuFilter;
