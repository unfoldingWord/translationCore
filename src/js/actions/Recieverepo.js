/** *
 @description: File to recieve a single repo and if you desired a single file
and its data from that single repo
 @return (File Folder in current Filepath) whole repo or if wanted the data from a repo file
 **/


var nodegit = require("nodegit");
var promisify = require("promisify-node");
var fse = promisify(require("fs-extra"));
var oldpath = require('path');
//makes a directory to store all of the files from the
//repo being inputted
var path = oldpath.join('Test');

fse.remove(path).then(function() {
  var entry;

//input the individual repo wanted for download after nodegit Clone
  nodegit.Clone(
    "https://git.door43.org/Door43/door43.org",
    path,
    {
      fetchOpts: {
        callbacks: {
          certificateCheck: function() {
            // github will fail cert check on some OSX machines
            // this overrides that check
            return 1;
          }
        }
      }
    });
  //statements to get specific file within repo by commit
  // .then(function(repo) {
  //   return repo.getCommit("59b20b8d5c6ff8d09518454d4dd8b7b30f095ab5");
  // })
  // .then(function(commit) {
  //   return commit.getEntry("README.md");
  // })

  //statements to get data within that specific file and logging
  // .then(function(entryResult) {
  //   entry = entryResult;
  //   return entry.getBlob();
  // })
  // .done(function(blob) {
  //   console.log(entry.name(), entry.sha(), blob.rawsize() + "b");
  //   console.log("========================================================\n\n");
  //   var firstTenLines = blob.toString().split("\n").slice(0, 10).join("\n");
  //   console.log(firstTenLines);
  //   console.log("...");
  // });
});
