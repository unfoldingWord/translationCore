
const BASE_URL = "https://git.door43.org/";
const TA_URL = "Door43/en-ta-translate-vol1/src/master/content";
//creates TranslationAcademyScraper class
class TranslationAcademyScraper{
  constructor() {
    this.sectionList = {};
    this.link = null;
  }
// gets the list of sections from tranlation academy by its url then fires the call back when done
  getTranslationAcademySectionList(url, callback) {
    console.log('Scraper');
    console.log(callback);
    var _this = this;
    var oReq = new XMLHttpRequest();
    oReq.onload = function() {
// this defines a new function that will be called later
      var links = getItemsBehindLink(this.response);
      _this.sectionList = mergeObjects(_this.sectionList, links);
      _this.link = url;
      console.dir(_this.sectionList);
      callback(_this.sectionList);
    }
    // created a new httprequest

      oReq.open("Get", url || BASE_URL + TA_URL, true);
      oReq.send();

  }

  getSection(sectionName, assignCallback) {

    if (!this.sectionList) {
      return;
    }
    console.log(sectionName);
    if (this.sectionList[sectionName]['file']) {
      if (assignCallback){
          assignCallback(this.sectionList[sectionName]['file']);
      }
    }

    else {
      var _this = this;
      var request = new XMLHttpRequest();
      var link = _this.sectionList[sectionName].replace('src','raw');
      request.onload = function(){
        // this takes  the response im getting from TA  and saves it in a file
        _this.sectionList[sectionName] = {
          "file" : this.response,
          "link": link
        }
        // This checks to see if the call back exists
        if (assignCallback){
          assignCallback(this.response);
        }
      }

      request.open("Get",BASE_URL link, true);
      request.send();
    }
  }
}
// the function that  merges object 2 in with object 1 (vol 1 and vol 2)
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
