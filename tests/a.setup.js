require("babel-register")({
  extensions: [".js", ".jsx"],
  presets: ["es2015", "react"],
  plugins: ["transform-object-rest-spread"]
});
require('../src/js/pages/index');
var ResourcesActions = require('../src/js/actions/ResourcesActions');
ResourcesActions.getResourcesFromStaticPackage(true);
