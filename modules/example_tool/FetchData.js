const api = window.ModuleApi;

function fetchData(params, progress, callback) {
  var request = makeHttpObject();
  
  request.onload = function() {
    var html = request.responseText.replace(/<head>([\s\S]*?)<\/head>/g, '')
                       .replace(/<header class=\"site-header\"([\s\S]*?)<\/header>/g, '')
                       .replace(/<footer([\s\S]*?)<\/footer>/g, '')
                       .replace(/<img([\s\S]*?)>/g, '')
                       .replace('</img>')
                       .replace('content-container', '')
                       .replace('container', '');
    api.putDataInCheckStore('ExampleTool', 'resourceHtml', html);
    callback();
  };

  request.onerror = function() {
    console.error('ExampleTool failed');
  }

  request.open('GET', 'https://unfoldingword.org/quality/', true);
  request.send();

}

function makeHttpObject() {
  try {return new XMLHttpRequest();}
  catch (error) {}
  try {return new ActiveXObject('Msxml2.XMLHTTP');}
  catch (error) {}
  try {return new ActiveXObject('Microsoft.XMLHTTP');}
  catch (error) {}

  throw new Error('Could not create HTTP request object.');
}

module.exports = fetchData;