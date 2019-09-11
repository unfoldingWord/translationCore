import React from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';

// components
import { Glyphicon } from 'react-bootstrap';
import { TextField } from 'material-ui';

const TextPrompt = ({
  id,
  text,
  title,
  updateText,
  getErrorMessage,
  required,
  infoText,
  className,
}) => {
  function getRequiredIcon() {
    if (required) {
      return (<span className={'required'}></span>);
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
              style={{
                fontSize: '16px', cursor: 'pointer', marginLeft: '5px',
              }}
            />
          </span>
          <ReactTooltip multiline={true}/>
        </span>
      );
    }
  }

  return (
    <div
      id={id+'-wrapper'}
      className={className}
      style={{
        marginTop: '20px',
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: 0,
        paddingRight: 0,
        color: '#000',
        fontSize: '16px',
        fontWeight: 'bold',
        lineHeight: '16px',
      }}
    >
      <label htmlFor={id} style={{ margin: 0 }}>
        <Glyphicon glyph={'book'} style={{ color: '#000000', fontSize: '16px' }}/>
        &nbsp;
        {title}
        &nbsp;
        {getRequiredIcon()}
        {getInfoIcon()}
      </label>
      <TextField
        id={id}
        value={text}
        style={{ height: '35px', fontWeight: 'normal' }}
        inputStyle={{ height: '25px' }}
        errorText={getErrorMessage(text)}
        errorStyle={{
          color: '#cd0033', height: '6px', bottom: 0, paddingTop: '5px',
        }}
        underlineFocusStyle={{ borderColor: 'var(--accent-color-dark)' }}
        onChange={(event, value) => {
          updateText(value);
        }}
      >
      </TextField>
    </div>
  );
};

TextPrompt.defaultProps = { className: 'text-propmpt' };

TextPrompt.propTypes = {
  id: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  updateText: PropTypes.func.isRequired,
  getErrorMessage: PropTypes.func.isRequired,
  required: PropTypes.bool.isRequired,
  infoText: PropTypes.string.isRequired,
  className: PropTypes.string,
};

export default TextPrompt;
