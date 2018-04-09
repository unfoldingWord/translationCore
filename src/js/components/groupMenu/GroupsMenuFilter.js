import React from 'react';
import PropTypes from 'prop-types';
import { Glyphicon } from 'react-bootstrap';
import InvalidatedIcon from '../svgIcons/InvalidatedIcon';
import GroupsMenuFilterOption from './GroupsMenuFilterOption';
import GroupsMenuFilterBubble from './GroupsMenuFilterBubble';

class GroupsMenuFilter extends React.Component {

  expandedFilter() {
    const {
      showInvalidated,
      showBookmarks,
      showSelections,
      showNoSelections,
      showVerseEdits,
      showComments,
      translate
    } = this.props;
    const checkboxes = [];

    checkboxes.push(<GroupsMenuFilterOption
      key="showInvalidated"
      name="showInvalidated"
      checked={showInvalidated}
      setFilter={this.props.setFilter}
      icon={<InvalidatedIcon width={16} height={16} color="#fff" />}
      text={translate('tools.invalidated')}/>);

    checkboxes.push(<GroupsMenuFilterOption
      key="showBookmarks"
      name="showBookmarks"
      checked={showBookmarks}
      setFilter={this.props.setFilter}
      icon={<Glyphicon glyph="bookmark" />}
      text={translate('tools.bookmarks')}/>);

    checkboxes.push(<GroupsMenuFilterOption
      key="showSelections"
      name="showSelections"
      checked={showSelections}
      disabled={showNoSelections}
      setFilter={this.props.setFilter}
      icon={<Glyphicon glyph="ok" />}
      text={translate('tools.selected')}/>);

    checkboxes.push(<GroupsMenuFilterOption
      key="showNoSelections"
      name="showNoSelections"
      checked={showNoSelections}
      disabled={showSelections}
      setFilter={this.props.setFilter}
      icon={<Glyphicon glyph="ban-circle" />}
      text={translate('tools.no_selection')}/>);

    checkboxes.push(<GroupsMenuFilterOption
      key="showVerseEdits"
      name="showVerseEdits"
      checked={showVerseEdits}
      setFilter={this.props.setFilter}
      icon={<Glyphicon glyph="pencil" />}
      text={translate('tools.verse_edit')}/>);

    checkboxes.push(<GroupsMenuFilterOption
      key="showComments"
      name="showComments"
      checked={showComments}
      setFilter={this.props.setFilter}
      icon={<Glyphicon glyph="comment" />}
      text={translate('tools.comments')}/>);

    return (
      <div id="groups-menu-filter">
        {checkboxes}
      </div>
    );
  }

  collapsedFilter() {
    const {
      showInvalidated,
      showBookmarks,
      showSelections,
      showNoSelections,
      showVerseEdits,
      showComments,
      translate
    } = this.props;
    const filters = [];

    if (showInvalidated) {
      filters.push(<GroupsMenuFilterBubble
        key='showInvalidated'
        name='showInvalidated'
        text={translate('tools.invalidated')}
        setFilter={this.props.setFilter} />);
    }

    if (showBookmarks) {
      filters.push(<GroupsMenuFilterBubble
        key='showBookmarks'
        name='showBookmarks'
        text={translate('tools.bookmarks')}
        setFilter={this.props.setFilter} />);
    }

    if (showSelections) {
      filters.push(<GroupsMenuFilterBubble
        key='showSelections'
        name='showSelections'
        text={translate('tools.selected')}
        setFilter={this.props.setFilter} />);
    }

    if (showNoSelections) {
      filters.push(<GroupsMenuFilterBubble
        key='showNoSelections'
        name='showNoSelections'
        text={translate('tools.no_selection')}
        setFilter={this.props.setFilter} />);
    }

    if (showVerseEdits) {
      filters.push(<GroupsMenuFilterBubble
        key='showVerseEdits'
        name='showVerseEdits'
        text={translate('tools.verse_edit')}
        setFilter={this.props.setFilter} />);
    }
    
    if (showComments) {
      filters.push(<GroupsMenuFilterBubble
        key='showComments'
        name='showComments'
        text={translate('tools.comments')}
        setFilter={this.props.setFilter} />);
    }

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
  showInvalidated: false,
  showBookmarks: false,
  showSelections: false,
  showNoSelections: false,
  showVerseEdits: false,
  showComments: false,
  expandFilter: false
};

GroupsMenuFilter.propTypes = {
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
