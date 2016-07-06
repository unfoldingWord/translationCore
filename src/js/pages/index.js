(function() {
  const ReactDOM = require('react-dom');
  const React = require('react');

  const remote = window.electron.remote;
  const {Menu} = remote;

  const TPane = require('../components/TPane');
// var db = require('./db-init');
  const UploadModal = require('../components/UploadModal');
  const MenuBar = require('../components/MenuBar');
  const TranslationAcademyScraper = require('../components/TranslationAcademyScraper');
  const DummyElement = React.createClass({
    //componentWillMount will run as soon as the dummy element is created
    componentWillMount: function() {                  // type
      // specific obect of TranslationAcademyScraper
      var translationAcademyScraper = new TranslationAcademyScraper;
      // once I have the obeject I call the getTranslationAcademySectionList function with the urls as the parameter
      translationAcademyScraper.getTranslationAcademySectionList("https://git.door43.org/Door43/en-ta-translate-vol1/src/master/content");
      translationAcademyScraper.getTranslationAcademySectionList("https://git.door43.org/Door43/en-ta-translate-vol2/src/master/content");
    },

    render: function() {
      return (
        <div>hi</div>
      );
    }
  });

  var App = {
    init: function() {
      var menu = Menu.buildFromTemplate(MenuBar.template);
      Menu.setApplicationMenu(menu);
      var Application = (
        <div>
          <TPane />
          <DummyElement />
          <UploadModal />
        </div>
      );
      ReactDOM.render(Application, document.getElementById('content'));
    }
  };

  window.App = App;
})();
document.addEventListener('DOMContentLoaded', App.init);
