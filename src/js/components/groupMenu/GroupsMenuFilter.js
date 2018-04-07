import React from 'react';
import PropTypes from 'prop-types';
import { Glyphicon } from 'react-bootstrap';
import InvalidatedIcon from '../svgIcons/InvalidatedIcon';
import GroupsMenuFilterBubble from './GroupsMenuFilterBubble';

class GroupsMenuFilter extends React.Component {

  handleCheckboxSelection(event) {
    const target = event.target;
    const value = target.checked;
    const name = target.name;
    this.props.setFilter(name, value);
  }

  handleFilterRemove(name) {
    this.props.setFilter(name, false);
  }

  expandedFilter() {
    const { translate } = this.props;
    return (
      <div id="groups-menu-filter">
        <div className="option">
          <span className="option-checkbox"><input type="checkbox" name="showInvalidated" checked={this.props.showInvalidated} onChange={this.handleCheckboxSelection.bind(this)} /></span>
          <span className="option-icon"><InvalidatedIcon width={16} height={16} color="#fff" /></span>
          <span className="option-text">{translate('tools.invalidated')}</span>
        </div>
        <div className="option">
          <span className="option-checkbox"><input type="checkbox" name="showBookmarks" checked={this.props.showBookmarks} onChange={this.handleCheckboxSelection.bind(this)} /></span>
          <span className="option-icon"><Glyphicon glyph="bookmark" /></span>
          <span className="option-text">{translate('tools.bookmarks')}</span>
        </div>
        <div className="option">
          <span className="option-checkbox"><input type="checkbox" name="showSelections" checked={this.props.showSelections} onChange={this.handleCheckboxSelection.bind(this)} /></span>
          <span className="option-icon"><Glyphicon glyph="ok" /></span>
          <span className="option-text">{translate('tools.selected')}</span>
        </div>
        <div className="option">
          <span className="option-checkbox"><input type="checkbox" name="showNoSelections" checked={this.props.showNoSelections} onChange={this.handleCheckboxSelection.bind(this)} /></span>
          <span className="option-checkbox"><Glyphicon glyph="ban-circle" /></span>
          <span className="option-text">{translate('tools.no_selection')}</span>
        </div>
        <div className="option">
          <span className="option-checkbox"><input type="checkbox" name="showVerseEdits" checked={this.props.showVerseEdits} onChange={this.handleCheckboxSelection.bind(this)} /></span>
          <span className="option-checkbox"><Glyphicon glyph="pencil" /></span>
          <span className="option-text">{translate('tools.verse_edit')}</span>
        </div>
        <div className="option">
          <span className="option-checkbox"><input type="checkbox" name="showComments" checked={this.props.showComments} onChange={this.handleCheckboxSelection.bind(this)} /></span>
          <span className="option-checkbox"><Glyphicon glyph="comment" /></span>
          <span className="option-text">{translate('tools.comments')}</span>
        </div>
      </div>
    );
  }

  bubbleFilter(text, name) {
    return (
      <GroupsMenuFilterBubble
        key={name}
        name={name}
        text={text}
        setFilter={this.props.setFilter} />
    );
  }

  collapsedFilter() {
    const { translate } = this.props;
    const filters = [];
    if (this.props.showInvalidated)
      filters.push(this.bubbleFilter(translate('tools.invalidated'), 'showInvalidated'));
    if (this.props.showBookmarks)
      filters.push(this.bubbleFilter(translate('tools.bookmarks'), 'showBookmarks'));
    if (this.props.showSelections)
      filters.push(this.bubbleFilter(translate('tools.selected'), 'showSelections'));
    if (this.props.showNoSelections)
      filters.push(this.bubbleFilter(translate('tools.no_selection'), 'showNoSelections'));
    if (this.props.showVerseEdits)
      filters.push(this.bubbleFilter(translate('tools.verse_edit'), 'showVerseEdits'));
    if (this.props.showComments)
      filters.push(this.bubbleFilter(translate('tools.comments'), 'showComments'));

    return (
      <div id="groups-menu-filter">
        {filters}
      </div>
    );
  }

  render() {
    if (this.props.expandFilter) {
      return this.expandedFilter();
    } else {
      return this.collapsedFilter();
    }
  }
}

GroupsMenuFilter.defaultProps = {
  showInvalidated: true,
  showBookmarks: true,
  showSelections: true,
  showNoSelections: true,
  showVerseEdits: true,
  showComments: true,
  expandFilter: false
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
  expandFilter: PropTypes.bool
};

export default GroupsMenuFilter;
