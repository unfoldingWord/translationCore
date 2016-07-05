



var CheckLib = React.createClass ({
  getInitialState: function() {
  return ({firstname: ["Gregory "],
      lastname: ["Fuentes"],
      gogs: ["3938"],
      changereport: ["ddks"],
      lastposition: ["34"],
  });
},


CreateFolder: function() {
        var _this = this;
        var fs = require('fs');
        var tmpDir = document.getElementById('fileInput').value;
        var path = require('path');
        var newpath = path.join(tmpDir);

        var manifest = path.join(newpath + '/manifest.json')

        fs.mkdir(newpath,function(e){

            if (e){

            //do something with content
            } else {
                  //debug
                  console.log(e);
                  fs.open(manifest, 'w', function(err, fd) {

                    if(err) {
                      return console.log(err);
                    }

                    var data1 = "firstname: " + _this.state.firstname.toString() + "\r\n" + "\n";
                    data1 += "lastname: " + _this.state.lastname.toString() + "\r\n" + "\n";
                    data1 += "gogs: " + _this.state.gogs.toString() + "\r\n" + "\n";
                    data1 += "changereport: " + _this.state.changereport.toString() + "\r\n" + "\n";
                    data1 += "lastposition: " + _this.state.lastposition.toString() + "\r\n" + "\n";

                    //TODO: Ask vicki about key and callbacks
                    fs.writeFile(manifest, data1, function(err) {
                      if(err) {
                        return console.log(err);
                      }
                      fs.close(fd);
                    });
                  });


            }
        });
        },


/*
      importstatusReport: function(localstorage) {
        //see if file is already created else create the new file
        if (!('"/" + fileInput.value + "/statusreport.json"'))
        {
          //Inserts a status report file inside the directory with clicked submit html element
          function SaveDatFileBro(localstorage) {
          localstorage.root.getFile("/" + fileInput.value + "/statusreport.json", {create: true});
          };
        }
        else {
          //import {status} from ("/" + fileInput.value + "/statusreport.json");
          //TODO: Write to file!!!


        var file = '"/" + fileInput.value + "/statusreport.json"'
        var fs = require("fs");

        if (file)
        {
          //Store file contents into JS object that is parsed
          var filebuffer = fs.readFileSync(file).toString();
          console.log("File opened successfully!");
          var obj = JSON.parse(filebuffer);
          //Set state with parsed file contents
          //this.setState({verses: obj.book.chapter.verses.map()});
          //this.setState({chapter: obj.book.chapter.map()});
          //this.setState({book: obj.book.map()});

        };

        fs.close(filebuffer, function(err){
             if (err){
                console.log(err);
             }
             else
             {
               console.log("Loading data into status report didnt work");
             }
          });

      }


    },
*/

    render: function() {
       return (
       <div>

       Create Project:
          <input type="text" id="fileInput" />
          <button onClick={this.CreateFolder}>Submit</button>

      </div>

    );
  },

  });


  ReactDOM.render(<CheckLib />, document.getElementById('app'));


    var TimeStamp = React.createClass({

    getInitialState: function() {
      var moment = new Date();
      var date = [moment.getMonth(), moment.getDate(), moment.getFullYear()];
      var Hours = [moment.getHours(), moment.getMinutes()];
      var nightday = 'AM';
      if (Hours[0] > 12)
      {
        Hours[0] = Hours[0] -12;
        nightday = "PM";
      }

      if (Hours[1] < 10)
      {
        Hours[1] = "0" + Hours[1];
      }

      return ({
        time: (date[0] + "/" + date[1] + "/" + date[2] + " " + Hours[0] + ":" + Hours[1] + " " + nightday)
      });
    },
    CreateTimeStamp: function() {
      var _this = this;
      var now;
      var time = new Date();
      var nightday = "AM";
      var day = [time.getMonth(), time.getDate(), time.getFullYear()];
      var hrs = [time.getHours(), time.getMinutes()];
      if (hrs[0] > 12)
      {
        Hours[0] = Hours[0] -12;
        nightday = "PM";
      }

      if (hrs[1] < 10)
      {
        Hours[1] = "0" + Hours[1];
      }
      now = (day[0] + "/" + day[1] + "/" + day[2] + " " + hrs[0] + ":" + hrs[1] + " " + nightday);
      console.log(now);

      if (!(_this.state.time == now))
      {
        console.log(this.state.time);
        _this.setState({time: now});
        return (now);
      }
        else
      {
        console.log(_this.state.time);
        return (_this.state.time);
      }
    },

    render: function() {
      var object = this.CreateTimeStamp().toString();
      console.log(object.toString());
      return (
        <div>
         File Last Saved on {object}
        </div>
      );
    }
  });


  ReactDOM.render(<TimeStamp />, document.getElementById('time'));


//      importcheckMods: function() {
//     //see if file is already created else create the new file
//     if (!("/" + fileInput.value + "/checkmods.json"))
//     {
//       //Inserts a status report file inside the directory with clicked submit html element
//       function SaveDatFileBro() {
//       localstorage.root.getFile("/" + fileInput.value + "/checkmods.json", {create: true});
//       //get the translation projects into the checklibrary from wherever they are stored
//       import {translationword} from ("/" + fileInput.value + "/checkmods.json");
//       import {translationnotes} from ("/" + fileInput.value + "/checkmods.json");
//       import {translationacademy} from ("/" + fileInput.value + "/checkmods.json");
//
//       {this.setState({translationword: status.props.translationword.map()});
//       {this.setState({translationnotes: status.props.translationnotes.map()})};
//       {this.setState({translationacademy: status.props.translationacademy.map()});}
//       };
//     }
//     else {
//
//
//     }
//   },
//
//
//   importglobalandtarget: function (localstorage) {
//     //Global language
//
//     //see if file is already created else create the new file
//     if (!(''"/" + fileInput.value + "/GL.json"''))
//     {
//       //Inserts a status report file inside the directory with clicked submit html element
//       function SaveDatFileBro(localstorage) {
//       localstorage.root.getFile("/" + fileInput.value + "/GL.json", {create: true});
//       };
//     }
//     else {
//       import {global} from ("/" + fileInput.value + "/GL.json");
//     }
//
//     //Target language
//     //see if file is already created else create the new file
//     if (!("/" + fileInput.value + "/TL.json"))
//     {
//       //Inserts a status report file inside the directory with clicked submit html element
//       function SaveDatFileBro(localstorage) {
//       localstorage.root.getFile("/" + fileInput.value + "/TL.json", {create: true});
//       };
//     }
//     else {
//       import {target} from ("/" + fileInput.value + "/TL.json");
//       var file = '"/" + fileInput.value + "/TL.json"'
//       var fs = require("fs");
//
//       if (filebuffer)
//       {
//         //Store file contents into JS object that is parsed
//         var filebuffer = fs.readFileSync(file).toString();
//         console.log("File opened successfully!");
//         var obj = JSON.parse(filebuffer);
//         //Set state with parsed file contents
//         this.setState({verses: obj.book.chapter.verses.map()});
//         this.setState({chapter: obj.book.chapter.map()});
//         this.setState({book: obj.book.map()});
//
//       });
//
//       fs.close(filebuffer, function(err){
//            if (err){
//               console.log(err);
//            }
//            console.log("File closed successfully.");
//         });
//       }
//       else
//       {
//         console.log("Loading data into status report didnt work");
//       }
//
//       }
//
//     }
//   },
//
//
//   importdatabase: function () {
//     var newpath = '"/" + fileInput.value + "/statusreport.json"'
//     var fs = require("fs");
//     //: get path for database
//     var oldpath
//     var filebuffer = fs.renameSync("", newpath)
//
//     fs.close(filebuffer, function(err){
//          if (err){
//             console.log(err);
//          }
//          console.log("File closed successfully.");
//       });
//     }
//     else
//     {
//       console.log("Loading data into status report didnt work");
//     }
//   },
