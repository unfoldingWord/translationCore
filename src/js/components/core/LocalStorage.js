/**
 * @author Ian Hoegen
 * @description: This component listens for updated settings, and saves them in the
 *               localStorage.
 **********************************************************************************/
const React = require('react');

class LocalStorage extends React.Component {
	componentDidMount() {
    var dispatch = this.props.dispatch;
    var localStorageSettings = JSON.parse(localStorage.getItem('settings'));
    for (var i in localStorageSettings) {
      dispatch.sendAction('SETTINGS_UPDATE', {name: i, value: localStorageSettings[i]});
    }
    dispatch.subscribe('SETTINGS_UPDATE', function(data) {
      var settings = dispatch.getData('SETTINGS_UPDATE');
      localStorage.setItem('settings', JSON.stringify(settings));
    });
	}

  componentWillUnmount() {
    dispatch.unsubscribe('SETTINGS_UPDATE');
  }

	render() {
    return <div></div>
  }
}

module.exports = LocalStorage;
