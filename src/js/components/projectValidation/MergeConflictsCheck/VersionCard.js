import React, { Component } from 'react';
import { RadioButton } from 'material-ui/RadioButton';
import PropTypes from 'prop-types';

class VersionCard extends Component {
  getTextObjectSection(verseData) {
    return Object.keys(verseData).map((verseNumber) => (
      <div style={{ fontSize: 14 }} key={verseNumber}>
        <b>{verseNumber}</b>: {verseData[verseNumber]}
      </div>
    ));
  }

  render() {
    let {
      checked, index, mergeConflictIndex, textData, translate,
    } = this.props;
    return (
      <div style={{ borderBottom: '1px solid black' }}>
        <div style={{ padding: 15 }}>
          <RadioButton
            checked={checked}
            label={translate('version', { 'version': Number(index) + 1 })}
            onCheck={() => this.props.onCheck(mergeConflictIndex, index, true)}
          />
          {this.getTextObjectSection(textData)}
        </div>
      </div>
    );
  }
}

VersionCard.propTypes = {
  index: PropTypes.string.isRequired,
  mergeConflictIndex: PropTypes.string.isRequired,
  textData: PropTypes.object.isRequired,
  onCheck: PropTypes.func.isRequired,
  checked: PropTypes.any,
  translate: PropTypes.func.isRequired,
};

export default VersionCard;