const url = require('url');
const https = require('follow-redirects').https;
const http = require('follow-redirects').http;
const fs = require('fs-extra');
const rimraf = require('rimraf');
const HttpAgent = require('agentkeepalive');
const HttpsAgent = require('agentkeepalive').HttpsAgent;

let httpAgent = new HttpAgent();
let httpsAgent = new HttpsAgent();

/**
 * Reads the contents of a url as a string.
 *
 * @param uri {string} the url to read
 * @returns {Promise.<string>} the url contents
 */
const read = (uri) => {
  "use strict";
  let parsedUrl = url.parse(uri, false, true);
  let makeRequest = parsedUrl.protocol === 'https:' ? https.request.bind(https) : http.request.bind(http);
  let serverPort = parsedUrl.port ? parsedUrl.port : parsedUrl.protocol === 'https:' ? 443 : 80;
  let agent = parsedUrl.protocol === 'https:' ? httpsAgent : httpAgent;

  let options = {
    host: parsedUrl.host,
    path: parsedUrl.path,
    agent: agent,
    port: serverPort,
    method: 'GET',
    headers: {'Content-Type': 'application/json'}
  };

  return new Promise((resolve, reject) => {

    let req = makeRequest(options, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        resolve({
          status: response.statusCode,
          data: data
        });
      });
    });

    req.on('socket', (socket) => {
      socket.setTimeout(30000);
    });
    req.on('error', reject);
    req.end();
  });
};

/**
 * Downloads a url to a file.
 *
 * @param uri {string} the uri to download
 * @param dest {string}
 * @param progressCallback {function} receives progress updates
 * @returns {Promise.<{}|Error>} the status code or an error
 */
const download = (uri, dest, progressCallback) => {
  "use strict";
  progressCallback = progressCallback || function() {};
  let parsedUrl = url.parse(uri, false, true);
  let makeRequest = parsedUrl.protocol === 'https:' ? https.request.bind(https) : http.request.bind(http);
  let serverPort = parsedUrl.port ? parsedUrl.port : parsedUrl.protocol === 'https:' ? 443 : 80;
  let agent = parsedUrl.protocol === 'https:' ? httpsAgent : httpAgent;
  let file = fs.createWriteStream(dest);

  let options = {
    host: parsedUrl.host,
    path: parsedUrl.path,
    agent: agent,
    port: serverPort,
    method: 'GET'
  };

  return new Promise((resolve, reject) => {
    let req = makeRequest(options, (response) => {
      let size = response.headers['content-length'];
      let progress = 0;

      response.on('data', (chunk) => {
        progress += chunk.length;
        progressCallback(size, progress);
      });

      response.pipe(file);
      file.on('finish', () => {
        resolve({
          status: response.statusCode
        });
      });
    });

    req.on('error', (error) => {
      file.end();
      rimraf.sync(dest);
      reject(error);
    });

    req.end();
  });
};

module.exports = {
  read,
  download
};