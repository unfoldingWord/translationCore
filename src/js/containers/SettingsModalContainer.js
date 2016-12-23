/**
 * @author Ian Hoegen
 * @description: This is the wrapper class for the SettingsModal, passes down
 *                needed data to it
 ******************************************************************************/
const React = require('react');
const SettingsModal = require('../components/core/SettingsModal');

class SettingsModalContainer extends React.Component {
	render() {
    var dispatch = this.props.dispatch;
    this.dispatch = dispatch;
		return (
			<SettingsModal
        show={this.props.show}
        onClose={function() {
          dispatch.sendAction('UPDATE_SETTINGS', false);
        }}
				onSettingsChange={function(field) {
          dispatch.sendAction('SETTINGS_UPDATE', {name: field.target.name, value: field.target.value});
        }}
        tutorialView={this.props.settings.tutorialView}
        developerMode={this.props.settings.developerMode}
        textSelect={this.props.settings.textSelect}
       />
		)
	}
}

module.exports = SettingsModalContainer;
