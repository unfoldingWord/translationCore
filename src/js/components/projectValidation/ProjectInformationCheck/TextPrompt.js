import React from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';

// components
import { Glyphicon } from 'react-bootstrap';
import { TextField } from 'material-ui';

const TextPrompt = ({
  text,
  title,
  updateText,
  getErrorMessage,
  required,
  infoText
}) => {
  function getRequiredIcon() {
    if (required) {
      return (<span style={{color: '#cd0033'}}>*</span>);
    }
  }

  function getInfoIcon() {
    if (infoText) {
      return (
        <span>
          <span
            data-tip={infoText}
            data-place="bottom"
            data-effect="float"
            data-type="dark"
            data-class="selection-tooltip"
            data-delay-hide="100" >
                <Glyphicon
                  glyph="info-sign"
                  style={{fontSize: "16px", cursor: 'pointer', marginLeft: '5px'}}
                />
          </span>
          <ReactTooltip multiline={true}/>
        </span>
      );
    }
  }

  return (
    <div>
      <div style={{
        width: '240px',
        height: '10px',
        marginTop: '12px',
        paddingTop: 0,
        paddingBottom: '2px',
        paddingLeft: 0,
        paddingRight: 0,
        color: '#000',
        fontSize: '16px',
        fontWeight: 'bold'
      }}>
        <Glyphicon glyph={"book"} style={{color: "#000000", fontSize: '16px'}}/>&nbsp;
        <span>{title}
          {getInfoIcon()}
          {getRequiredIcon()}
          </span>
      </div>
      <TextField
        id="resource-id-textfield"
        value={text}
        style={{width: '230px', height: '40px'}}
        errorText={getErrorMessage(text)}
        errorStyle={{color: '#cd0033', height: '6px', bottom: 0}}
        underlineFocusStyle={{borderColor: "var(--accent-color-dark)"}}
        onChange={(event, value) => {
          updateText(value);
        }}
      >
      </TextField>
    </div>
  );
};

TextPrompt.propTypes = {
  text: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  updateText: PropTypes.func.isRequired,
  getErrorMessage: PropTypes.func.isRequired,
  required: PropTypes.bool.isRequired,
  infoText: PropTypes.string.isRequired
};

export default TextPrompt;
