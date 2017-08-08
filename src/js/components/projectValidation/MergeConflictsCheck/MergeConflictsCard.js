import React, { Component } from 'react';
import PropTypes from 'prop-types';
//icons
import RightArrow from 'material-ui/svg-icons/hardware/keyboard-arrow-right';
import DownArrow from 'material-ui/svg-icons/hardware/keyboard-arrow-down';
//components
import IconButton from 'material-ui/IconButton';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';

class MergeConflictsCheck extends Component {
  constructor(props) {
    super(props);
    this.getVersionSection = this.getVersionSection.bind(this);
  }

  getTextObjectSection(textSectionData) {
    return textSectionData.map((verseData) => {
      return (
        <div style={{ fontSize: 14 }} key={verseData.verseNum}>
          <b>{verseData.verseNum}</b>: {verseData.verse}
        </div>
      )
    })
  }

  getVersionSection(versions, mergeConflictIndex) {
    return versions.map((version) => {
      return (
        <div key={`${mergeConflictIndex}-${version.index}`} style={{ borderBottom: '1px solid black' }}>
          <div style={{ padding: 15 }}>
            <RadioButton
              checked={version.checked}
              label={`Version ${Number(version.index) + 1}`}
              onCheck={(e) => this.props.onCheck(e, mergeConflictIndex, version.index)}
            />
            {this.getTextObjectSection(version.textSectionData)}
          </div>
        </div>
      )
    }, this)
  }

  render() {
    let { mergeConflictIndex, versions, conflict, chapter, verses } = this.props;
    let borderBottom = conflict.open ? 'none' : '1px solid black';
    return (
      <div style={{ borderBottom: borderBottom, paddingBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', }}>
          <div style={{ padding: '15px 15px 0px 15px' }}>
            <div style={{ fontWeight: 'bold', paddingBottom: 5 }}>Merge Conflict #{Number(mergeConflictIndex) + 1}</div>
            <div>This is a merge conflict for chapter {chapter}, verse {verses}.</div>
          </div>
          {conflict.open ?
            <div
              style={{ cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', height: 40, width: 40, borderRadius: '50%', border: '2px solid black', margin: '15px 15px 0px auto' }}
              onClick={() => this.props.openMergeCard(mergeConflictIndex, false)}>
              <RightArrow style={{ height: 60, width: 60 }} />
            </div>
            :
            <div
              style={{ cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', height: 40, width: 40, borderRadius: '50%', border: '2px solid black', margin: '15px 15px 0px auto' }}
              onClick={() => this.props.openMergeCard(mergeConflictIndex, true)}>
              <DownArrow style={{ height: 60, width: 60 }} />
            </div>
          }
        </div>
        {conflict.open ? this.getVersionSection(versions, mergeConflictIndex) : null}
      </div>
    );
  }
}

MergeConflictsCheck.propTypes = {
  openMergeCard: PropTypes.func.isRequired,
  mergeConflictIndex: PropTypes.string.isRequired,
  versions: PropTypes.array.isRequired,
  conflict: PropTypes.array.isRequired
}

export default MergeConflictsCheck;