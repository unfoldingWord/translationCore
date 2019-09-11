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
  updateCheckerName,
  checkersRequiredFieldMessage,
  translate,
  id,
  className,
}) => (
  <div
    id={id}
    className={className}
  >
    <div>
      <GroupAddIcon style={{
        height: '28px', width: '28px', color: '#000000', verticalAlign: 'top',
      }} />&nbsp;
      <span style={{ fontWeight: 'bold' }}>{translate('project_validation.checkers')}</span>
    </div>
    <div
      onClick={() => addChecker()}
      style={{
        color: 'var(--accent-color-dark)', cursor: 'pointer', userSelect: 'none',
      }}
    >
      <Glyphicon
        glyph="plus"
        style={{ color: 'var(--accent-color-dark)', fontSize: '18px' }}
      />&nbsp;
      <span>{translate('project_validation.add_checker')}</span>
    </div>
    <div>
      {
        checkers.map((checkerName, index) => {
          const showRequiredFieldError = checkersRequiredFieldMessage && index === 0;
          return (
            <div key={index} style={{ marginLeft: '30px' }}>
              <TextField
                id={index.toString()}
                value={checkerName}
                underlineFocusStyle={{ borderColor: 'var(--accent-color-dark)' }}
                style={{ width: '165px' }}
                onChange={e => updateCheckerName(e.target.value, index)}
                autoFocus={checkerName === '' ? true : false }
                errorText={showRequiredFieldError ? translate('required_field') : ''}
              />
              <Glyphicon
                glyph="trash"
                onClick={() => removeChecker(index)}
                style={{ fontSize: '18px', cursor: 'pointer' }}
              />
            </div>
          );
        })
      }
    </div>
  </div>
);

CheckersArea.defaultProps = {
  id: 'checkers-area',
  className: 'checkers-area',
};

CheckersArea.propTypes = {
  translate: PropTypes.func.isRequired,
  checkers: PropTypes.array.isRequired,
  addChecker: PropTypes.func.isRequired,
  removeChecker: PropTypes.func.isRequired,
  updateCheckerName: PropTypes.func.isRequired,
  checkersRequiredFieldMessage: PropTypes.bool.isRequired,
  id: PropTypes.string,
  className: PropTypes.string,
};

export default CheckersArea;
