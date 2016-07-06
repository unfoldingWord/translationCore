(function() {
  const ReactDOM = require('react-dom');
  const React = require('react');
// var db = require('./db-init');
  const FileUpload = require('./fileupload');
  const remote = window.electron.remote;
  const {Menu} = remote;
  const menubar = require('./menubar');
  const CheckingScreen =  require('./CheckingScreen');

  const TranslationAcademyScraper = require('./TranslationAcademyScraper');
  const DummyElement = React.createClass({
    //componentWillMount will run as soon as the dummy element is created
    componentWillMount: function() {                  // type
      // specific obect of TranslationAcademyScraper
      var translationAcademyScraper = new TranslationAcademyScraper;
      // once I have the obeject I call the getTranslationAcademySectionList function with the urls as the parameter
      translationAcademyScraper.getTranslationAcademySectionList1("https://git.door43.org/Door43/en-ta-translate-vol1/src/master/content");
    },

    render: function() {
      return (
        <div>hi</div>
      );
    }
  });
// the app is going to render the dummy element
  var App = {
    init: function() {

      ReactDOM.render(<DummyElement />,document.getElementById('content'));
    }
  };

  window.App = App;
})();
document.addEventListener('DOMContentLoaded', App.init);
