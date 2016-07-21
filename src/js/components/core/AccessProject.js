/**
 * @description: File to open a created TC project and read and return its contents
 * @param (string) files and file paths inside of read directory
 **/

var React = require('react');
var remote = window.electron.remote;
var fs = require(window.__base + 'node_modules/fs-extra');
var {dialog} = remote;
var CoreActions = require('../../actions/CoreActions.js');
var path = require('path');
var CoreStore = require('../../stores/CoreStore.js');
var FileImport = require('./FileImport.js');
var LoadOnline = require('./LoadOnline.js');

var Access = {
  openDir: function(path) {
    var input;
    try {
        //CoreStore as an object
        var fileArr = [];
        fs.readdir(path, function(err, items){
        console.log(items);
        for (var i=0; i<items.length; i++) {
          var newpath = path.concat('\\'); //TODO:
          newpath = newpath.concat(items[i]);
          fileArr.push(newpath); //TODO: Correct method
          }
        console.log(fileArr);
        for (var j=0;j<items.length;j++) {
          if (items[j] == "manifest.json")
          {
            console.log('Found the Manifest!!!!!!!!!');
            fs.readFile(fileArr[j], function(err,data){
              if (err)
                {
                  return console.log(err);
                }
              input = JSON.parse(data);
              console.log(input);
              if (typeof input.source.original_language !== undefined)
              {
                console.log("Getting the Original Language---------------------");
                if (input.source.original_language.local == true)
                {
                  console.log("Using Local Path");
                  FileImport(input.source.original_language.path);
                }
                else {
                  LoadOnline(input.source.original_language.path);
                }
              }
              if (typeof input.source.target_language !== undefined)
              {
                console.log("Getting the Target Language---------------------");
                if (input.source.target_language.local == true)
                {
                  console.log("Using Local Path");
                  FileImport(input.source.target_language.path);
                }
                else {
                  LoadOnline(input.source.target_language.path);
                }
              }
              if (typeof input.source.gateway_language !== undefined)
              {
                console.log("Getting the Gateway Language---------------------");
                if (input.source.gateway_language.local == true)
                {
                  console.log("Using Local Path");
                  FileImport(input.source.gateway_language.path);
                }
                else {
                  LoadOnline(input.source.gateway_language.path);
                }
              }

            });
          }
        }

        });

      } catch (e){
      alert('An error has occurred: '+ e.message);
      }


  },

};

module.exports = Access;

//call callback with directory and possilby display file folders
