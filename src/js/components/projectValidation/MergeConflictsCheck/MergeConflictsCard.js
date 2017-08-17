import React, { Component } from 'react';
import PropTypes from 'prop-types';
//icons
import RightArrow from 'material-ui/svg-icons/hardware/keyboard-arrow-right';
import DownArrow from 'material-ui/svg-icons/hardware/keyboard-arrow-down';
//components
import VersionCard from './VersionCard';

class MergeConflictsCheck extends Component {
  constructor(props) {
    super(props);
    this.getVersionSection = this.getVersionSection.bind(this);
  }

  getVersionSection(versions, mergeConflictIndex) {
    return versions.map((version) => {
      return (
        <VersionCard 
        key={`${mergeConflictIndex}-${version.index}`}
        onCheck={this.props.onCheck}
        {...version}
        mergeConflictIndex={mergeConflictIndex}/>
      )
    })
  }

  render() {
    let { mergeConflictIndex, versions, chapter, verses, open } = this.props;
    let borderBottom = open ? 'none' : '1px solid black';
    return (
      <div style={{ borderBottom: borderBottom, paddingBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', }}>
          <div style={{ padding: '15px 15px 0px 15px' }}>
            <div style={{ fontWeight: 'bold', paddingBottom: 5 }}>Merge Conflict #{Number(mergeConflictIndex) + 1}</div>
            <div>This is a merge conflict for chapter {chapter}, verse {verses}.</div>
          </div>
          {open ?
            <div
              style={{ cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', height: 40, width: 40, borderRadius: '50%', border: '2px solid black', margin: '15px 15px 0px auto' }}
              onClick={() => this.props.openCard(mergeConflictIndex, false)}>
              <RightArrow style={{ height: 60, width: 60 }} />
            </div>
            :
            <div
              style={{ cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', height: 40, width: 40, borderRadius: '50%', border: '2px solid black', margin: '15px 15px 0px auto' }}
              onClick={() => this.props.openCard(mergeConflictIndex, true)}>
              <DownArrow style={{ height: 60, width: 60 }} />
            </div>
          }
        </div>
        {open ? this.getVersionSection(versions, mergeConflictIndex) : null}
      </div>
    );
  }
}

MergeConflictsCheck.propTypes = {
  mergeConflictIndex: PropTypes.string.isRequired,
  versions: PropTypes.array.isRequired,
  chapter: PropTypes.string.isRequired,
  verses: PropTypes.string.isRequired
}

export default MergeConflictsCheck;