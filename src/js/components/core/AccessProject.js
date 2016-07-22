/**
 * @description: File to open a created TC project and read and open contents in TPane
 * @param (string) file path
 **/

var React = require('react');
var remote = window.electron.remote;
var fs = require(window.__base + 'node_modules/fs-extra');
var {dialog} = remote;
var path = require('path');
var CheckDataGrabber = require('./create_project/CheckDataGrabber.js');

var params = {};

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
          if (items[j] == "manifest.json") {
            fs.readFile(fileArr[j], function(err,data){
              if (err) {
                return dialog.showErrorBox(err);
              }
              input = JSON.parse(data);
              if (typeof input.ts_project !=== undefined) {
                params.bookAbbr = input.ts_project.id;
              }

              if (typeof input.source.original_language !=== undefined) {
                if (input.source.original_language.local === true) {
                  params.originalLanguagePath = window.__base + input.source.original_language.path;
                }
                else {
                  //API.LoadOnline(input.source.original_language.path);
                }
              }
              if (typeof input.source.target_language !=== undefined) {
                if (input.source.target_language.local === true) {
                  params.targetLanguagePath = input.source.target_language.path;
                }
                else {
                }
              }
              if (typeof input.source.gateway_language !=== undefined) {
                if (input.source.gateway_language.local === true) {
                  // params.gatewayLangugePath = input.source.gateway_language.path;
                }
                else {
                  //API.LoadOnline(input.source.gateway_language.path);
                }
              }
              var fetchDataArray = [];
              if (typeof input.check_module_locations !=== undefined) {
                for (item in input.check_module_locations) {
                  var currentItem = input.check_module_locations[item];
                  fetchDataArray.push([currentItem.name, currentItem.location]);
                  //API.putDataInCommon(input.check_data_locations[k].name, input.check_data_locations[k].path);
                }
              }
              if (fetchDataArray.length > 0) {
                CheckDataGrabber.getFetchData(fetchDataArray, params);
              }
            });
          }
        }

        });

      } catch (e) {
      dialog.showErrorBox('An error has occurred: '+ e.message);
      }
  },
};

module.exports = Access;
