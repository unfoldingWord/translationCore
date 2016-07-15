const fs = require(window.__base + 'node_modules/fs-extra');
const path = window.__base + 'projects/';
const FileModule = require('./FileModule');

var project = {
  createProject: function(manifest, projectName){
    //fields for project requirement may be changed
    var currentProject = {
      'Project Config': {
        'gogsID':""
      },
      'CheckLibraries':  {
      },
      'Report':{
      }
    };
    for (var element in manifest) {
      currentProject['Project Config'][element] = manifest[element];
    }
    try {
      var file = fs.readdirSync(window.__base + 'src/js/components/modules');
      for (var element of file) {
        currentProject['Report'][element] = [];
        currentProject['CheckLibraries'][element] = {};
        //pick checks to display, username, optional email
      }
    } catch (e) {
      console.log(e);
    }
    // Put the object into storage
    var data = JSON.stringify(currentProject);
    var fdpath = path.concat(projectName);
    var filepath = fdpath.concat('/currentProject.json');
    if (!fs.existsSync(fdpath)){
      fs.mkdirSync(fdpath);
      fs.writeFile(filepath, data, function(err) {
        if(err) {
          return console.log(err);
        }
      });
    }
  },
  //localStorage.setItem('currentProject', JSON.stringify(currentProject));
  // Retrieve the object from storage
  loadProject: function() {
    try {
      FileModule.readFile(path, function(project) {
      });
    } catch (error) {
      console.log(error);
    };
  }
};

module.exports = project;
