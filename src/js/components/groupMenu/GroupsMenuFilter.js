import React from 'react';
import PropTypes from 'prop-types';
import { Glyphicon } from 'react-bootstrap';
import InvalidatedIcon from '../svgIcons/InvalidatedIcon';
import GroupsMenuFilterOption from './GroupsMenuFilterOption';
import GroupsMenuFilterBubble from './GroupsMenuFilterBubble';

class GroupsMenuFilter extends React.Component {

  expandedFilter() {
    const {
      filters,
      translate
    } = this.props;
    const options = [];

    options.push(<GroupsMenuFilterOption
      key="invalidated"
      name="invalidated"
      checked={filters.invalidated}
      toggleFilter={this.props.toggleFilter}
      icon={<InvalidatedIcon width={16} height={16} color="#fff" />}
      text={translate('tools.invalidated')}/>);

    options.push(<GroupsMenuFilterOption
      key="reminders"
      name="reminders"
      checked={filters.reminders}
      toggleFilter={this.props.toggleFilter}
      icon={<Glyphicon glyph="bookmark" />}
      text={translate('tools.bookmarks')}/>);

    options.push(<GroupsMenuFilterOption
      key="selections"
      name="selections"
      checked={filters.selections}
      disabled={filters.noSelections}
      toggleFilter={this.props.toggleFilter}
      icon={<Glyphicon glyph="ok" />}
      text={translate('tools.selected')}/>);

    options.push(<GroupsMenuFilterOption
      key="noSelections"
      name="noSelections"
      checked={filters.noSelections}
      disabled={filters.selections}
      toggleFilter={this.props.toggleFilter}
      icon={<Glyphicon glyph="ban-circle" />}
      text={translate('tools.no_selection')}/>);

    options.push(<GroupsMenuFilterOption
      key="verseEdits"
      name="verseEdits"
      checked={filters.verseEdits}
      toggleFilter={this.props.toggleFilter}
      icon={<Glyphicon glyph="pencil" />}
      text={translate('tools.verse_edit')}/>);

    options.push(<GroupsMenuFilterOption
      key="comments"
      name="comments"
      checked={filters.comments}
      toggleFilter={this.props.toggleFilter}
      icon={<Glyphicon glyph="comment" />}
      text={translate('tools.comments')}/>);

    return (
      <div id="groups-menu-filter" className="options-wrapper">
        {options}
      </div>
    );
  }

  collapsedFilter() {
    const {
      translate,
      filters
    } = this.props;
    const bubbles = [];

    if (filters.invalidated) {
      bubbles.push(<GroupsMenuFilterBubble
        key='invalidated'
        name='invalidated'
        text={translate('tools.invalidated')}
        toggleFilter={this.props.toggleFilter} />);
    }

    if (filters.reminders) {
      bubbles.push(<GroupsMenuFilterBubble
        key='reminders'
        name='reminders'
        text={translate('tools.bookmarks')}
        toggleFilter={this.props.toggleFilter} />);
    }

    if (filters.selections) {
      bubbles.push(<GroupsMenuFilterBubble
        key='selections'
        name='selections'
        text={translate('tools.selected')}
        toggleFilter={this.props.toggleFilter} />);
    }

    if (filters.noSelections) {
      bubbles.push(<GroupsMenuFilterBubble
        key='noSelections'
        name='noSelections'
        text={translate('tools.no_selection')}
        toggleFilter={this.props.toggleFilter} />);
    }

    if (filters.verseEdits) {
      bubbles.push(<GroupsMenuFilterBubble
        key='verseEdits'
        name='verseEdits'
        text={translate('tools.verse_edit')}
        toggleFilter={this.props.toggleFilter} />);
    }
    
    if (filters.comments) {
      bubbles.push(<GroupsMenuFilterBubble
        key='comments'
        name='comments'
        text={translate('tools.comments')}
        toggleFilter={this.props.toggleFilter} />);
    }

    return (
      <div id="groups-menu-filter" className="bubbles-wrapper">
        {bubbles}
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
  expandFilter: false
};

GroupsMenuFilter.propTypes = {
  translate: PropTypes.func.isRequired,
  toggleFilter: PropTypes.func.isRequired,
  filters: PropTypes.object.isRequired,
  expandFilter: PropTypes.bool
};

export default GroupsMenuFilter;
