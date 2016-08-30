function saveAsPDF() {
      const saveOptions = {
        title: 'Save Report',
        filters: [
          { name: 'PDF', extensions: ['pdf'] }
        ]
      };
      let dialog = require("electron").remote.dialog;
      dialog.showSaveDialog(saveOptions, function(savePath) {
        if (savePath && savePath != "") {
          // allows us to get the webContents of the window
          let remote = require('electron').remote;
          remote.getCurrentWebContents().printToPDF({}, (err, data) => {
            if (err) {
              console.log(err);
              return;
            }
            require('fs').writeFile(savePath, data, err => {
              if (err) console.log(err);
              else console.log("PDF Write Complete!");
            });
          });
        }
      });
}
