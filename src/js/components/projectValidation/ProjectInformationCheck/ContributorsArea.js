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
  removeContributor
}) => {
  return (
    <div style={{ display: 'flex', flex: '1', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', margin: '10px'}}>
        <GroupIcon style={{ height: "30px", width: "30px", color: "#000000" }} />&nbsp;
      <span>Contributors</span>
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
          contributors.map((name, index) => {
            return (
              <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                <TextField
                  id={index.toString()}
                  value={name}
                  underlineFocusStyle={{ borderColor: "var(--accent-color-dark)" }}
                  style={{ width: '200px' }}
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
  removeContributor: PropTypes.func.isRequired
};

export default ContributorsArea;