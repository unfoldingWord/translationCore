/* eslint-disable no-console */
import React from 'react';
import PropTypes from 'prop-types';
// components
import GroupIcon from 'material-ui/svg-icons/social/group';
import { Glyphicon } from 'react-bootstrap';
import { TextField } from 'material-ui';

const ContributorsArea = ({
  contributors,
  addContributor,
  removeContributor,
  updateContributorName,
  contributorsRequiredFieldMessage,
  translate,
  id,
  className,
}) => (
  <div
    id={id}
    className={className}
  >
    <div>
      <GroupIcon style={{
        height: '28px', width: '28px', color: '#000000', verticalAlign: 'top',
      }} />&nbsp;
      <span style={{ fontWeight: 'bold' }}>{translate('project_validation.contributors')}</span>
    </div>
    <div
      onClick={() => addContributor()}
      style={{
        color: 'var(--accent-color-dark)', cursor: 'pointer', userSelect: 'none',
      }}
    >
      <Glyphicon
        glyph="plus"
        style={{ color: 'var(--accent-color-dark)', fontSize: '18px' }}
      />&nbsp;
      <span>{translate('project_validation.add_contributor')}</span>
    </div>
    <div>
      {
        contributors.map((contributorName, index) => {
          const showRequiredFieldError = contributorsRequiredFieldMessage && index === 0;
          return (
            <div key={index} style={{ marginLeft: '30px' }}>
              <TextField
                id={index.toString()}
                value={contributorName}
                underlineFocusStyle={{ borderColor: 'var(--accent-color-dark)' }}
                style={{ width: '165px' }}
                onChange={e => updateContributorName(e.target.value, index)}
                autoFocus={contributorName === '' ? true : false }
                errorText={showRequiredFieldError ? translate('required_field') : ''}
              />
              <Glyphicon
                glyph="trash"
                onClick={() => removeContributor(index)}
                style={{ fontSize: '18px', cursor: 'pointer' }}
              />
            </div>
          );
        })
      }
    </div>
  </div>
);

ContributorsArea.defaultProps = {
  id: 'contributor-area',
  className: 'contributor-area',
};

ContributorsArea.propTypes = {
  translate: PropTypes.func.isRequired,
  contributors: PropTypes.array.isRequired,
  addContributor: PropTypes.func.isRequired,
  removeContributor: PropTypes.func.isRequired,
  updateContributorName: PropTypes.func.isRequired,
  contributorsRequiredFieldMessage: PropTypes.bool.isRequired,
  id: PropTypes.string,
  className: PropTypes.string,
};

export default ContributorsArea;
