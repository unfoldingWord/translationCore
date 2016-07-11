var ReactDOM = require('react-dom');
var React = require('react');
//Creates a directory that is inputted and creates given
//files using inputted states from different modules

var CheckLib = React.createClass ({
  getInitialState: function() {
  return ({firstname: ["Gregory "],
      lastname: ["Fuentes"],
      gogs: ["3938"],
      changereport: ["ddks"],
      lastposition: ["34"],
      statusreport: ["blah"],
  });
},

CreateFolder: function() {
        var _this = this;
        var fs = require(window.__base + 'node_modules/fs-extra');
        var tmpDir = document.getElementById('fileInput').value;
        var path = require('path');
        var newpath = path.join(tmpDir);
        var manifest = path.join(newpath + '/manifest.json');

        fs.mkdir(newpath,function(e){
            if (e){
            //do something with content
            } else {
                  //debug
            console.log(e);
            }
          });

  //Create Manifest file
        fs.open(manifest, 'w', function(err, fd) {

              if(err) {
                return console.log(err);
              }


                });

                var data1 = "firstname: " + _this.state.firstname.toString() + "\r\n" + "\n";
                data1 += "lastname: " + _this.state.lastname.toString() + "\r\n" + "\n";
                data1 += "gogs: " + _this.state.gogs.toString() + "\r\n" + "\n";
                data1 += "changereport: " + _this.state.changereport.toString() + "\r\n" + "\n";
                data1 += "lastposition: " + _this.state.lastposition.toString() + "\r\n" + "\n";

          fs.writeFile(manifest, data1, function(err) {
                    if(err) {
                        return console.log(err);
                      }
                    });


//Create Status Report File
          var status = path.join(newpath + '/statusreport.json');

          fs.open(status, 'w', function(err, fd) {

                    if(err) {
                      return console.log(err);
                    }

                  });

                  var data = _this.state.statusreport;


          fs.writeFile(status, data, function(err) {
                    if(err) {
                      return console.log(err);
                    }
                  });

            },

    render: function() {
       return (
       <div>
          Create Project:
          <input type="text" id="fileInput" />
          <button onClick={this.CreateFolder} value="Submit" type="submit" />
       </div>
    );
  }

  });
    module.exports = CheckLib;
