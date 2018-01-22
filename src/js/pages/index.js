(function () {
  try {
    require("babel-register")({
      extensions: [".js", ".jsx"],
      presets: ["es2015", "react"],
      plugins: ["transform-object-rest-spread"]
    });
  } catch (error) {
    console.log('Bypass babel in production');
  }
  const ReactDOM = require('react-dom');
  const remote = require('electron').remote;
  const {Menu} = remote;
  const MenuBar = require('../components/MenuBar');
  window.App = {
    init: function () {
      let menu = Menu.buildFromTemplate(MenuBar.template);
      Menu.setApplicationMenu(menu);
      let Application = require("./root").App;
      ReactDOM.render(Application, document.getElementById('content'));
    }
  };
})();
document.addEventListener('DOMContentLoaded', window.App.init);
