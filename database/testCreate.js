var CheckLib = React.createClass ({
  constructor () {
    super();
    this.state = {
      firstname: "Greg",
      lastname: "Fuentes",
      gogs: "293829",
      changereport: "Blah",
      lastposition: "38939"
    };
  }

createFolder: function(localstorage) {
      //statements make it able to store permanently in local storage
      window.webkitRequestFileSystem(window.PERSISTENT , 1024*1024, SaveDatFileBro);
      navigator.webkitPersistentStorage.requestQuota(1024*1024, function() {
      &nbsp;window.webkitRequestFileSystem(window.PERSISTENT , 1024*1024, SaveDatFileBro);
      })
      //statement makes the directory
      //fileInput is the name of the input element
      function SaveDatFileBro(localstorage) {
      localstorage.root.getDirectory(fileInput.value, {create: true}, function() {});
      }
      //Inserts a file inside the directory with the inputted name that is submitted
      function SaveDatFileBro(localstorage) {
      localstorage.root.getFile("/" + fileInput.value + "/Manifest.json", {create: true});
      };

      //set state for book after user inputs title of bible book project ex: "Luke"
      this.setState({book: fileInput.value});

      //Input text into the given opened file that was created with the given input name
      function SaveDatFileBro(localstorage) {
      localstorage.root.getFile("Manifest.json", {create: true}, function(DatFile) {
      DatFile.createWriter(function(DatContent) {
      var line = new Blob(["First Name:" + {this.state.firstname} + "<br>"], {type: "text/plain"});
      var line += new Blob(["Last Name:" + {this.state.lastname} + "<br>"], {type: "text/plain"});
      var line += new Blob(["Gogs ID:" + {this.state.gogs} + "<br>"], {type: "text/plain"});
      var line += new Blob(["Changes Report:" + {this.state.changereport} + "<br>"], {type: "text/plain"});
      var line += new Blob(["Last position:" + {this.state.lastposition} + "<br>"], {type: "text/plain"});
      DatContent.write(line);
      });
      });
      }

    });
