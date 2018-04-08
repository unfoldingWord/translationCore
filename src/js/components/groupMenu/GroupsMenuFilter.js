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
      currentToolName,
      translate
    } = this.props;
    const checkboxes = [];

    if (currentToolName !== 'wordAlignment') {
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
    } else {
      checkboxes.push(<GroupsMenuFilterOption
        key="showSelections"
        name="showSelections"
        checked={showSelections}
        disabled={showNoSelections}
        setFilter={this.props.setFilter}
        icon={<Glyphicon glyph="ok" />}
        text={translate('tools.aligned')}/>);

      checkboxes.push(<GroupsMenuFilterOption
        key="showNoSelections"
        name="showNoSelections"
        checked={showNoSelections}
        disabled={showSelections}
        setFilter={this.props.setFilter}
        icon={<Glyphicon glyph="ban-circle" />}
        text={translate('tools.no_alignment')}/>);
    }

    return (
      <div id="groups-menu-filter">
        {checkboxes}
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
    const {
      showInvalidated,
      showBookmarks,
      showSelections,
      showNoSelections,
      showVerseEdits,
      showComments,
      currentToolName,
      translate
    } = this.props;
    const filters = [];
    if (showInvalidated)
      filters.push(this.bubbleFilter(translate('tools.invalidated'), 'showInvalidated'));
    if (showBookmarks)
      filters.push(this.bubbleFilter(translate('tools.bookmarks'), 'showBookmarks'));
    if (showSelections)
      filters.push(this.bubbleFilter(currentToolName!=="wordAlignment"?translate('tools.selected'):translate('tools.aligned'), 'showSelections'));
    if (showNoSelections)
      filters.push(this.bubbleFilter(currentToolName!=="wordAlignment"?translate('tools.no_selection'):translate('tools.no_alignment'), 'showNoSelections'));
    if (showVerseEdits)
      filters.push(this.bubbleFilter(translate('tools.verse_edit'), 'showVerseEdits'));
    if (showComments)
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
  showInvalidated: false,
  showBookmarks: false,
  showSelections: false,
  showNoSelections: false,
  showVerseEdits: false,
  showComments: false,
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
