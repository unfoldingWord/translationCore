/* eslint-disable no-console */
import fs from 'fs-extra';
import csv from 'csv';

/**
 * @description - Generates a CSVString from an array of objects
 * @param {Array} objectArray - array of objects to convert to csv
 * @param {function} The callback that passes err, csv string output
 */
export const generateCSVString = (objectArray, callback) => {
  if (objectArray.length > 0) {
    // extract the headers from the objectArray, assuming first is representative
    const headers = Object.keys(objectArray[0]);
    // loop through the objectArray to generate a row from each object in the array
    const rows = objectArray.map(object => {
      // use the headers to get the values of each object to create the row
      const row = headers.map(header => {
        return object[header];
      });
      return row;
    });
    // make the headers the first row and append the rows
    const data = [headers].concat(rows);
    csv.stringify(data, function(err, data){
      callback(err, data);
    });
  } else { // there is no data, give back enough data to create an empty file.
    const data = [['No data']];
    callback(null, data);
  }
}
/**
 * @description - Generates a CSV and writes to File from an array of objects
 * @param {Array} objectArray - array of objects to convert to csv
 * @param {string} filePath - path of the file to write
 * @param {function} The callback that passes err, csv string output
 */
export const generateCSVFile = (objectArray, filePath) => {
  return new Promise(function(resolve, reject) {
    generateCSVString(objectArray, (err, csvString) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        try {
          if (csvString) {
            fs.outputFileSync(filePath, csvString);
          }
          resolve(true);
        } catch (_err) {
          console.log(_err);
          reject(_err);
        }
      }
    })
  });
}
