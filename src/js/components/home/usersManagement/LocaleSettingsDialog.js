import React from 'react';
import PropTypes from 'prop-types';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Dialog from 'material-ui/Dialog';
import Button from 'material-ui/RaisedButton';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

const contentStyle = {
  opacity: "1",
  width: '90%',
  maxWidth: 'none',
  height: '100%',
  maxHeight: 'none',
  padding: 0,
  top: -30
};

const bodyStyle = {
  padding: 0,
  minHeight: '80vh',
  backgroundColor: 'var(--background-color-light)'
};

const DialogActions = ({onClose, onSave, translate}) => (
  <div>
    <Button onClick={onClose} secondary={true} label={translate('cancel')}/>
    <Button onClick={onSave} primary={true} label={translate('save')}/>
  </div>
);
DialogActions.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  translate: PropTypes.func.isRequired
};

/**
 * The dialog for controlling locale settings within the app
 */
export default class  LocaleSettingsDialog extends React.Component {

  constructor(props) {
    super(props);
    this.handleSave = this.handleSave.bind(this);
    this.handleLanguageChange = this.handleLanguageChange.bind(this);
    this.state = {
      selectedLanguage: props.currentLanguage
    };
  }

  handleSave() {
    const {setActiveLanguage, onClose} = this.props;
    setActiveLanguage(this.state.selectedLanguage);
    onClose();
  }

  handleLanguageChange(language) {
    this.setState({
      selectedLanguage: language
    });
  }

  render() {
    const {
      open=false,
      onClose,
      translate,
      languages
    } = this.props;
    const dialogActions = (
      <DialogActions onClose={onClose}
                     onSave={this.handleSave}
                     translate={translate}/>
    );
    const {selectedLanguage} = this.state;
    return (
      <MuiThemeProvider>
        <Dialog open={open}
                actions={dialogActions}
        >
          <div style={{ padding: '30px'}}>
            <SelectField
              floatingLabelText="Application Language"
              value={selectedLanguage}
              onChange={(e, key, payload) => this.handleLanguageChange(payload)}
            >
              {languages.map((language, key) => {
                return <MenuItem key={key}
                                 value={language.code}
                                 primaryText={language.name}/>;
              })}
            </SelectField>

          </div>
        </Dialog>
      </MuiThemeProvider>
    );
  }
}

LocaleSettingsDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  translate: PropTypes.func.isRequired,
  setActiveLanguage: PropTypes.func.isRequired,
  languages: PropTypes.array.isRequired,
  currentLanguage: PropTypes.string.isRequired
};
