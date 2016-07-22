

const BASE_URL = "https://git.door43.org/";
const TA_URLS = [
  "Door43/en-ta-translate-vol1/src/master/content",
  "Door43/en-ta-translate-vol2/src/master/content"
];
// creates TranslationAcademyScraper class
class TranslationAcademyScraper {
  constructor() {
    this.sectionList = {};
  }

  getFullTranslationAcademySectionList(callback) {
    var promises = [];
    for(let taUrl of TA_URLS) {
		  var promise = new Promise((resolve, reject) => {
        this.getTranslationAcademySectionListForUrl(taUrl, resolve);
      });
      promises.push(promise);
    }
	  Promise.all(promises).then(value => {
      callback(this.sectionList);
    }, reason => {
      console.log('Translation Academy failed to load section list.');
    });
  }

  // Gets the list of sections from translation academy by its url then fires the call back when done
  getTranslationAcademySectionListForUrl(taUrl, callback) {
    var _this = this;
    var oReq = new XMLHttpRequest();
    oReq.onload = function() {
      var links = getItemsBehindLink(this.response);
      _this.sectionList = mergeObjects(_this.sectionList, links);
      callback(_this.sectionList);
    };
    oReq.open("Get", BASE_URL + taUrl, true);
    oReq.send();
  }

  getSection(sectionName, assignCallback) {
    if (!this.sectionList) {
      return;
    }

    if (!this.sectionList[sectionName]) {
    }
    else {
      if (this.sectionList[sectionName]['file']) {
        if (assignCallback) {
          assignCallback(this.sectionList[sectionName]['file']);
        }
      }

      else {
        var _this = this;
        var request = new XMLHttpRequest();
        var link = _this.sectionList[sectionName].replace('src', 'raw');
        request.onload = function() {
// this takes  the response im getting from TA  and saves it in a file
          _this.sectionList[sectionName] = {
            "file": this.response,
            "link": link
          };
// This checks to see if the call back exists
          if (assignCallback) {
            assignCallback(this.response);
          }
        };

        request.open("Get", BASE_URL + link, true);
        request.send();
      }
    }
  }
}
// the function that  merges object 2 in with object 1 (vol 1 and vol 2)
function mergeObjects(obj1, obj2) {
  var obj3 = {};
  for (var attrname in obj1) {obj3[attrname] = obj1[attrname];}
  for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
  return obj3;
}

function getItemsBehindLink(htmlString) {
  var regex = new RegExp('<a href="([^"]+)">(\\w*\\.md)(?=</a>\\s*?</td>)', 'g'); /* nasty regex that matches links on
*/
  var returnValue = {};

  var matches = regex.exec(htmlString); // matches[2] is key, matches[1] is link
  while (matches != null) {
    returnValue[matches[2]] = matches[1]; /* assigns the attribute tag with link;
ex. 'aaron.md': https://git.door43.org/Door43/tw-en/src/master/01/aaron.md
in the returnObject
*/
    matches = regex.exec(htmlString);
  }
  return returnValue;
}
var scraper = new TranslationAcademyScraper();
module.exports = scraper;
