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
  updateContributorName
}) => {
  return (
    <div style={{ display: 'flex', flex: '1', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', margin: '10px'}}>
        <GroupIcon style={{ height: "28px", width: "28px", color: "#000000" }} />&nbsp;
        <span style={{ fontWeight: 'bold' }}>Contributors</span>
      </div>
      <div
        onClick={() => addContributor()}
        style={{ color: "var(--accent-color-dark)", cursor: "pointer", userSelect: 'none' }}
      >
        <Glyphicon
          glyph="plus"
          style={{ color: "var(--accent-color-dark)", fontSize: "18px" }}
        />&nbsp;
        <span>Add Contributor</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        {
          contributors.map((contributorName, index) => {
            return (
              <div key={index} style={{ display: 'flex', alignItems: 'center', marginLeft: '30px' }}>
                <TextField
                  id={index.toString()}
                  value={contributorName}
                  underlineFocusStyle={{ borderColor: "var(--accent-color-dark)" }}
                  style={{ width: '165px' }}
                  onChange={e => updateContributorName(e.target.value, index)}
                  autoFocus={contributorName === "" ? true : false }
                />
                <Glyphicon
                  glyph="trash"
                  onClick={() => removeContributor(index)}
                  style={{ fontSize: "18px", cursor: "pointer" }}
                />
              </div>
            )
          })
        }
      </div>
    </div>
  );
};

ContributorsArea.propTypes = {
  contributors: PropTypes.array.isRequired,
  addContributor: PropTypes.func.isRequired,
  removeContributor: PropTypes.func.isRequired,
  updateContributorName: PropTypes.func.isRequired
};

export default ContributorsArea;