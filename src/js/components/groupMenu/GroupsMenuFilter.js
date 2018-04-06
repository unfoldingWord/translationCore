import React from 'react';
import PropTypes from 'prop-types';
import { Glyphicon } from 'react-bootstrap';
import InvalidatedIcon from '../svgIcons/InvalidatedIcon';

class GroupsMenuFilter extends React.Component {

  handleCheckboxSelection(event) {
    const target = event.target;
    const value = target.checked;
    const name = target.name;
    this.props.setFilter(name, value);
  }

  render() {
    return (
      <div id="groups-menu-filter">
        <div className="option">
          <span className="object-checkbox"><input type="checkbox" name="showInvalidated" checked={this.props.showInvalidated} onChange={this.handleCheckboxSelection.bind(this)} /></span>
          <span className="object-icon"><InvalidatedIcon width={16} height={16} color="#fff" /></span>
          <span className="object-text">Invalidated</span>
        </div>
        <div className="option">
          <span className="option-checkbox"><input type="checkbox" name="showBookmarks" checked={this.props.showBookmarks} onChange={this.handleCheckboxSelection.bind(this)} /></span>
          <span className="option-icon"><Glyphicon glyph="bookmark" /></span>
          <span className="option-text">Bookmarks</span>
        </div>
        <div className="option">
          <span className="option-checkbox"><input type="checkbox" name="showSelections" checked={this.props.showSelections} onChange={this.handleCheckboxSelection.bind(this)} /></span>
          <span className="option-icon"><Glyphicon glyph="ok" /></span>
          <span className="option-text">Selected</span>
        </div>
        <div className="option">
          <span className="option-checkbox"><input type="checkbox" name="showNoSelections" checked={this.props.showNoSelections} onChange={this.handleCheckboxSelection.bind(this)} /></span>
          <span className="option-checkbox"><Glyphicon glyph="ban-circle" /></span>
          <span className="option-text">No Selection</span>
        </div>
        <div className="option">
          <span className="option-checkbox"><input type="checkbox" name="showVerseEdits" checked={this.props.showVerseEdits} onChange={this.handleCheckboxSelection.bind(this)} /></span>
          <span className="option-checkbox"><Glyphicon glyph="pencil" /></span>
          <span className="option-text">Verse edit</span>
        </div>
        <div className="option">
          <span className="option-checkbox"><input type="checkbox" name="showComments" checked={this.props.showComments} onChange={this.handleCheckboxSelection.bind(this)} /></span>
          <span className="option-checkbox"><Glyphicon glyph="comment" /></span>
          <span className="option-text">Comments</span>
        </div>
      </div>
    );
  }
}

GroupsMenuFilter.defaultProps = {
  showInvalidated: true,
  showBookmarks: true,
  showSelections: true,
  showNoSelections: true,
  showVerseEdits: true,
  showComments: true
};

GroupsMenuFilter.propTypes = {
  currentToolName: PropTypes.string.isRequired,
  translate: PropTypes.func.isRequired,
  setFilter: PropTypes.func.isRequired,
  showInvalidated: PropTypes.bool,
  showBookmarks: PropTypes.bool,
  showSelections: PropTypes.bool,
  showNoSelections: PropTypes.bool,
  showVerseEdits: PropTypes.bool,
  showComments: PropTypes.bool,
};

export default GroupsMenuFilter;
