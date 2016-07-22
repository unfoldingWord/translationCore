/**
 * @description: File to open a created TC project and read and open contents in TPane
 * @param (string) file path
 **/

var React = require('react');
var remote = window.electron.remote;
var fs = require(window.__base + 'node_modules/fs-extra');
var {dialog} = remote;
var path = require('path');
var FileImport = require('./FileImport.js');
var LoadOnline = require('./LoadOnline.js');

var Access = {
  openDir: function(path) {
    var input;
    try {
        var fileArr = [];
        var API = window.ModuleApi;
        fs.readdir(path, function(err, items){
        for (var i=0; i<items.length; i++) {
          var newpath = path.concat('\\');
          newpath = newpath.concat(items[i]);
          fileArr.push(newpath);
          }
        for (var j=0;j<items.length;j++) {
          if (items[j] == "manifest.json")
          {
            fs.readFile(fileArr[j], function(err,data){
              if (err)
                {
                  return console.log(err);
                }
              input = JSON.parse(data);
              console.log(input);
              if (typeof input.source.original_language !== undefined)
              {
                if (input.source.original_language.local == 'true')
                {
                  console.log("Using Local Path");
                  console.log(input.source.original_language.path);
                  //API.FileImport(input.source.original_language.path);
                }
                else {
                  console.log('Load Online');
                  //API.LoadOnline(input.source.original_language.path);
                }
              }
              if (typeof input.source.target_language !== undefined)
              {
                if (input.source.target_language.local == 'true')
                {
                  console.log("Using Local Path");
                  console.log(input.source.target_language.path);
                  API.FileImport(input.source.target_language.path);
                }
                else {
                  console.log('Load Online');
                  //API.LoadOnline(input.source.target_language.path);
                }
              }
              if (typeof input.source.gateway_language !== undefined)
              {
                if (input.source.gateway_language.local == 'true')
                {
                  console.log("Using Local Path");
                  console.log(input.source.gateway_language.path);
                  //API.FileImport(input.source.gateway_language.path);
                }
                else {
                  console.log('Load Online');
                  //API.LoadOnline(input.source.gateway_language.path);
                }
              }
              if (typeof input.check_data_locations !== undefined)
              {
                for (var k=0;k<input.check_data_locations.length;k++)
                {
                  console.log("Loading the fetch data");
                  //API.putDataInCommon(input.check_data_locations[k].name, input.check_data_locations[k].path);
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
