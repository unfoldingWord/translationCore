
const DEFAULT_URL = "https://git.door43.org/Door43/en-ta-translate-vol1/src/master/content";

class TranslationAcademyScraper{
  constructor() {
    this.sectionList = {};
    this.link = null;
  }

  getTranslationAcademySectionList(url=DEFAULT_URL) {
    var _this = this;
    function reqListener() {
// this defines a new function that will be called later
      var links = getItemsBehindLink(this.response);
      _this.sectionList = mergeObjects(_this.sectionList, links);
      _this.link = url;
      console.dir(_this.sectionList);
    }
    // created a new httprequest
      var oReq = new XMLHttpRequest();
      oReq.onload = reqListener;
      oReq.open("Get", url);
      oReq.send();

    }

  getSection(assignCallback) {

    if (!this.sectionList) {
      return;
    }

    if (this.sectionList[key]['file']) {
      if (assignCallback){
          assignCallback(this.sectionList[key]['file']);
      }
    }
    else {
      var _this = this;
      var request = new XMLHttpRequest();

      request.onload = function(){
        var link = _this.sectionList[key].replace('src','raw');
        _this.sectionList[key] = {
          "file" : this.response,
          "link": link
        }
        // passes the file to the call back
        if (assignCallback){
          assignCallback(this.response);
        }
      }

      request.open("Get",url);
    }
  }
}

function mergeObjects(obj1,obj2){
  var obj3={};
  for (var attrname in obj1){obj3[attrname]=obj1[attrname];}
  for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
  return obj3;
}





function getItemsBehindLink(htmlString) {

    var regex = new RegExp('<a href="([^"]+)">(\\w*\\.md)(?=</a>\\s*?</td>)', 'g'); /* nasty regex that matches links on
*/
    var returnValue = {};

    var matches = regex.exec(htmlString); //matches[2] is key, matches[1] is link
    while (matches != null) {
		returnValue[matches[2]] = matches[1]; /* assigns the attribute tag with link;
						 ex. 'aaron.md': https://git.door43.org/Door43/tw-en/src/master/01/aaron.md
						 in the returnObject
					      */
		matches = regex.exec(htmlString);
    }
    return returnValue;
}

module.exports = TranslationAcademyScraper;
