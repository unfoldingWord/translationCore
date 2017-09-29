/* eslint-disable no-console */
import React from 'react';
import PropTypes from 'prop-types';
// components
import { TextField } from 'material-ui';
import GroupAddIcon from 'material-ui/svg-icons/social/group-add';
import { Glyphicon } from 'react-bootstrap';

const CheckersArea = ({
  checkers,
  addChecker,
  removeChecker,
  updateCheckerName
}) => {
  return (
    <div style={{ display: 'flex', flex: '1', flexDirection: 'column', alignItems: 'center', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', margin: '10px'}}>
        <GroupAddIcon style={{ height: "28px", width: "28px", color: "#000000" }} />&nbsp;
        <span style={{ fontWeight: 'bold' }}>Checkers</span>
      </div>
      <div
        onClick={() => addChecker()}
        style={{ color: "var(--accent-color-dark)", cursor: "pointer", userSelect: 'none' }}
      >
        <Glyphicon
          glyph="plus"
          style={{ color: "var(--accent-color-dark)", fontSize: "18px" }}
        />&nbsp;
        <span>Add Checker</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {
          checkers.map((checkerName, index) => {
            return (
              <div key={index} style={{ display: 'flex', alignItems: 'center', marginLeft: '30px' }}>
                <TextField
                  id={index.toString()}
                  value={checkerName}
                  underlineFocusStyle={{ borderColor: "var(--accent-color-dark)" }}
                  style={{ width: '165px' }}
                  onChange={e => updateCheckerName(e.target.value, index)}
                  autoFocus={checkerName === "" ? true : false }
                />
                <Glyphicon
                  glyph="trash"
                  onClick={() => removeChecker(index)}
                  style={{ fontSize: "18px", cursor: "pointer" }}
                />
              </div>
            );
          })
        }
      </div>
    </div>
  );
};

CheckersArea.propTypes = {
  checkers: PropTypes.array.isRequired,
  addChecker: PropTypes.func.isRequired,
  removeChecker: PropTypes.func.isRequired,
  updateCheckerName: PropTypes.func.isRequired
};

export default CheckersArea;