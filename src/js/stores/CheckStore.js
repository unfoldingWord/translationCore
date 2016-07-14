/**
 * @author Logan Lebanoff
 * @description Stores data relating to Check Modules.
 *              It has data like: an array of all the checks, the id of the current
 *              check category, and a list of all the check cateogry options.
 ******************************************************************************/

var EventEmitter = require('events').EventEmitter;
var Dispatcher = require('../dispatchers/Dispatcher');
var CheckConsts = require("../actions/CheckActionConsts.js");
var FileModule = require("../components/core/FileModule.js");
var utils = require("../utils.js");
var Fetcher = require('../components/modules/phrase_check_module/FetchData');

var CHANGE_EVENT = 'change';

class CheckStore extends EventEmitter {
  constructor() {
    super();

    this.groupIndex = 0;
    this.checkIndex = 0;

    this.groups = [
            {
               "group":"figs_you",
               "checks":[
                  {
                     "chapter":1,
                     "verse":1,
                     "phrase":"grace be to you",
                     "phraseInfo":"The word \"you\" refers to all the believers at Ephesus. (See: [[en:ta:vol1:translate:figs_you]])\n",
                     "checked":false
                  },
                  {
                     "chapter":4,
                     "verse":1,
                     "phrase":"I urge you to live worthily of the calling",
                     "phraseInfo":"In all these verses the word \"you\" refers to all the believers at Ephesus. AT: \"I encourage with you to conduct yourself in a manner proper of the calling\" (See: [[en:ta:vol1:translate:figs_you]])\n",
                     "checked":false
                  }
               ]
            },
            {
               "group":"figs_activepassive",
               "checks":[
                  {
                     "chapter":1,
                     "verse":3,
                     "phrase":"May the God and Father of our Lord Jesus Christ be praised",
                     "phraseInfo":"This could be worded in the active form. AT: \"Let us praise the God and Father of our Lord Jesus Christ\" (See: [[en:ta:vol2:translate:figs_activepassive]])\n",
                     "checked":false
                  },
                  {
                     "chapter":4,
                     "verse":7,
                     "phrase":"To each one of us has been given a gift",
                     "phraseInfo":"AT: \"A gift has been given to each believer\" or \"God gave a gift to each one of us\" (See: [[en:ta:vol2:translate:figs_activepassive]])\n",
                     "checked":false
                  }
               ]
            },
            {
               "group":"figs_inclusive",
               "checks":[
                  {
                     "chapter":1,
                     "verse":3,
                     "phrase":"has blessed us ",
                     "phraseInfo":"This is an inclusive pronoun referring to Paul and all the believers at Ephesus. (See: [[en:ta:vol2:translate:figs_inclusive]])\n",
                     "checked":false
                  },
                  {
                     "chapter":1,
                     "verse":5,
                     "phrase":"predestined us",
                     "phraseInfo":"Paul was including himself, the Ephesian church and all believers in Christ in his use of \"us.\" (See: [[en:ta:vol2:translate:figs_inclusive]])\n",
                     "checked":false
                  },
                  {
                     "chapter":1,
                     "verse":7,
                     "phrase":"we have redemption",
                     "phraseInfo":"\"We\" refers to all believers. (See: [[en:ta:vol2:translate:figs_inclusive]])\n",
                     "checked":false
                  },
                  {
                     "chapter":2,
                     "verse":8,
                     "phrase":"come from us",
                     "phraseInfo":"The pronoun \"us\" refers to Paul and all the believers at Ephesus. (See: [[en:ta:vol2:translate:figs_inclusive]])\n",
                     "checked":false
                  },
                  {
                     "chapter":2,
                     "verse":13,
                     "phrase":" divided us from each other",
                     "phraseInfo":"\"Us\" refers to both Paul and the Ephesians, that separated the Jewish believers from the Gentile believers. (See [[en:ta:vol2:translate:figs_inclusive]])\n",
                     "checked":false
                  },
                  {
                     "chapter":2,
                     "verse":17,
                     "phrase":"For through Jesus we both have access",
                     "phraseInfo":"\"We both\" refers to both Paul, the believing Jews and the believing non-Jews. (See: [[en:ta:vol2:translate:figs_inclusive]])\n",
                     "checked":false
                  },
                  {
                     "chapter":3,
                     "verse":20,
                     "phrase":"that we ask or think",
                     "phraseInfo":"\"We\" includes Paul and his audience. (See: [[en:ta:vol2:translate:figs_inclusive]])\n",
                     "checked":false
                  },
                  {
                     "chapter":4,
                     "verse":7,
                     "phrase":"To each one of us",
                     "phraseInfo":"The word \"us\" includes Paul and all the believers at Ephesus. (See: [[en:ta:vol2:translate:figs_inclusive]])\n",
                     "checked":false
                  },
                  {
                     "chapter":4,
                     "verse":25,
                     "phrase":"we are members of each other",
                     "phraseInfo":"AT: \"we are all members of God's family\" (See: [[en:ta:vol2:translate:figs_inclusive]])\n",
                     "checked":false
                  },
                  {
                     "chapter":5,
                     "verse":28,
                     "phrase":"we are members of his body",
                     "phraseInfo":"The word \"we\" refers to Paul and all the believers. (See: [[en:ta:vol2:translate:figs_inclusive]])\n",
                     "checked":false
                  }
               ]
            },
            {
               "group":"figs_doublet",
               "checks":[
                  {
                     "chapter":1,
                     "verse":3,
                     "phrase":"so we could be holy and blameless",
                     "phraseInfo":"Paul states two traits that we can become in God. (See: [[en:ta:vol2:translate:figs_doublet]])\n",
                     "checked":false
                  },
                  {
                     "chapter":2,
                     "verse":1,
                     "phrase":"your trespasses and your sins",
                     "phraseInfo":"The words \"trespasses\" and \"sins\" mean basically the same thing. Paul uses them together to emphasize the greatness of the people's sin. (See: [[en:ta:vol2:translate:figs_doublet]])\n",
                     "checked":false
                  },
                  {
                     "chapter":5,
                     "verse":25,
                     "phrase":"without stain or wrinkle",
                     "phraseInfo":"Paul speaks of the Church as a garment that is clean and in good condition. He uses the same idea in two ways to emphasize the Church's purity. (See: [[:en:ta:vol1:translate:figs_metaphor]] and [[en:ta:vol2:translate:figs_doublet]])\n",
                     "checked":false
                  },
                  {
                     "chapter":5,
                     "verse":25,
                     "phrase":"holy and without fault",
                     "phraseInfo":"The phrase \"without fault\" means basically the same thing as \"holy.\" Paul uses the two together to emphasize the Church's purity. (See: [[en:ta:vol2:translate:figs_doublet]])\n",
                     "checked":false
                  }
               ]
            },
            {
               "group":"figs_metaphor",
               "checks":[
                  {
                     "chapter":1,
                     "verse":13,
                     "phrase":" were sealed with the promised Holy Spirit",
                     "phraseInfo":"As wax was placed on a letter and impressed with a symbol representing who sent the letter, God sealed our salvation with the Holy Spirit signifying his ownership of us. (See: [[en:ta:vol1:translate:figs_metaphor]])\n",
                     "checked":false
                  },
                  {
                     "chapter":2,
                     "verse":1,
                     "phrase":"And you were dead in your trespasses and your sins",
                     "phraseInfo":"This shows how sinful people are unable to obey God in the same way a dead person is unable to respond physically. (See: [[en:ta:vol1:translate:figs_metaphor]])\n",
                     "checked":false
                  },
                  {
                     "chapter":3,
                     "verse":17,
                     "phrase":"that you be rooted and grounded in his love",
                     "phraseInfo":"Paul compares their faith like a tree that has deep roots or a house build on a solid foundation. AT: \"that you will be like a firmly rooted tree and a building founded upon stone\" (See: [[en:ta:vol1:translate:figs_metaphor]])\n",
                     "checked":false
                  },
                  {
                     "chapter":4,
                     "verse":4,
                     "phrase":"one body",
                     "phraseInfo":"All believers in the family of God are like the various members of a human body. (See: [[en:ta:vol1:translate:figs_metaphor]])\n",
                     "checked":false
                  },
                  {
                     "chapter":4,
                     "verse":11,
                     "phrase":"for the building up of the body of Christ",
                     "phraseInfo":"This metaphor compares growing spiritually to doing exercises to increase the strength of the human body. (See: [[en:ta:vol1:translate:figs_metaphor]])\n",
                     "checked":false
                  },
                  {
                     "chapter":4,
                     "verse":14,
                     "phrase":"be like children",
                     "phraseInfo":"This is comparing a believer who has not grown spiritually to a child who has had very little experience in life. (See: [[en:ta:vol1:translate:figs_metaphor]])\n",
                     "checked":false
                  },
                  {
                     "chapter":4,
                     "verse":14,
                     "phrase":"tossed around and carried away by every wind of teaching",
                     "phraseInfo":"This metaphor compares a believer who has not become mature and hears wrong teaching to a boat that is being blown by the wind in random directions on the water. (See: [[en:ta:vol1:translate:figs_metaphor]])\n",
                     "checked":false
                  },
                  {
                     "chapter":5,
                     "verse":25,
                     "phrase":"he cleansed us by the washing of water by the word",
                     "phraseInfo":"Possible meanings are 1) Paul is referring to having been made clean by God's word and through water baptism in Christ or 2) Paul is saying God made us spiritually clean from our sins by the word of God like we make our bodies clean by washing with water. (See: [[en:ta:vol1:translate:figs_metaphor]])\n",
                     "checked":false
                  },
                  {
                     "chapter":5,
                     "verse":28,
                     "phrase":"we are members of his body",
                     "phraseInfo":"Possible meanings are 1) \"we are members of his body of believers\" (non-metaphorical sense) or 2) Believers fit together to form the body of Christ just as the parts of the human body fit together to form a person. (See: [[en:ta:vol1:translate:figs_metaphor]])\n",
                     "checked":false
                  }
               ]
            },
            {
               "group":"figs_litotes",
               "checks":[
                  {
                     "chapter":1,
                     "verse":15,
                     "phrase":"I have not stopped thanking God",
                     "phraseInfo":"This can be translated as a positive statement. AT: \"I continue to thank God\" (See: [[en:ta:vol2:translate:figs_litotes]])\n",
                     "checked":false
                  }
               ]
            },
            {
               "group":"figs_idiom",
               "checks":[
                  {
                     "chapter":1,
                     "verse":17,
                     "phrase":"that the eyes of your heart may be enlightened",
                     "phraseInfo":"The phrase \"eyes of your heart\" expresses one's ability to  gain understanding. AT: \"that you may gain understanding and be enlightened\" (See: [[en:ta:vol1:translate:figs_idiom]])\n",
                     "checked":false
                  },
                  {
                     "chapter":1,
                     "verse":19,
                     "phrase":"seated him at his right hand",
                     "phraseInfo":"\"seated Christ at God's right hand.\" This is the highest place of honor. (See: [[en:ta:vol1:translate:figs_idiom]])\n",
                     "checked":false
                  },
                  {
                     "chapter":2,
                     "verse":1,
                     "phrase":" you once walked",
                     "phraseInfo":"This expresses the behavior of how people live. AT: \"you once lived\" (see [[en:ta:vol1:translate:figs_idiom]])\n",
                     "checked":false
                  }
               ]
            },
            {
               "group":"figs_explicit",
               "checks":[
                  {
                     "chapter":3,
                     "verse":6,
                     "phrase":"For this I became a servant",
                     "phraseInfo":"AT: \"I am now serving God to spread the gospel\" (see [[en:ta:vol1:translate:figs_explicit]])\n",
                     "checked":false
                  },
                  {
                     "chapter":3,
                     "verse":12,
                     "phrase":"access with confidence",
                     "phraseInfo":"AT: \"access into God's presence with confidence\" or \"freedom to enter into God's presence with confidence\" (See: [[en:ta:vol1:translate:figs_explicit]])\n",
                     "checked":false
                  },
                  {
                     "chapter":3,
                     "verse":14,
                     "phrase":"For this cause",
                     "phraseInfo":"AT: \"Because God has done all this for you\" (See: [[en:ta:vol1:translate:figs_explicit]])\n",
                     "checked":false
                  },
                  {
                     "chapter":4,
                     "verse":11,
                     "phrase":"Christ gave gifts like these",
                     "phraseInfo":"AT: \"Christ gave gifts to the Church like these\" (See: [[en:ta:vol1:translate:figs_explicit]])\n",
                     "checked":false
                  }
               ]
            },
            {
               "group":"translate_names",
               "checks":[
                  {
                     "chapter":6,
                     "verse":21,
                     "phrase":"Tychicus",
                     "phraseInfo":"Tychicus was one of several men who served with Paul. (See: [[en:ta:vol1:translate:translate_names]])\n",
                     "checked":false
                  }
               ]
            }
         ];

    // -1 means no checkCategory is selected
    this.checkCategoryId = -1;
    // TODO: this needs to be filled with actual data when the project is loaded
    this.checkCategoryOptions = [
      {
          name: "Lexical Checks",
          id: 1,
          filePath: window.__base + "/data/projects/eph_mylanguage/check_modules/lexical_check_module/check_data.json"
      },
      {
          name: "Phrase Checks",
          id: 2,
          filePath: window.__base + "/data/projects/eph_mylanguage/check_modules/phrase_check_module/check_data.json"
      }
    ];
    // For ExampleCheckModule
    this.checkIndex = 0;
  }

  // Public function to return a list of all of the groups, which contain checks.
  // Should usually be used by the navigation menu, not the check module, because
  // the check module only displays a single check
  getAllGroups() {
    return this.groups;
  }


  // Public function to return a list of all of the checks.
  // Should usually be used by the navigation menu, not the check module, because
  // the check module only displays a single check
  getAllChecks() {
    return this.groups;
  }

  // Public function to return a deep clone of the current group
  // Why not just return this.groups[this.groupIndex]? Because that returns a reference to

  // the object, and we don't want any changes made here to be reflected elsewhere,
  // and vice versa
  getCurrentGroup() {
    var group = this.groups[this.groupIndex];
    return utils.cloneObject(group);
  }

  // Public function to return a deep clone of the current check
  // Why not just return this.checks[this.checkIndex]? See getCurrentGroup()
  getCurrentCheck() {
    if(this.groups.length == 0){
      return null;
    }
    var check = this.groups[this.groupIndex].checks[this.checkIndex];
    return utils.cloneObject(check);
  }

  // Public function to return the current check's position in the groups array
  getGroupIndex() {
    return this.groupIndex;
  }

  // Public function to return the current check's position in the checks array
  getCheckIndex() {
    return this.checkIndex;
  }

  setCurrentCheckProperty(propertyName, propertyValue) {
    this.groups[this.groupIndex].checks[this.checkIndex][propertyName] = propertyValue;
  }

  getCurrentCheckCategory() {
    return this.getCheckCategory(this.checkCategoryId);
  }

  findById(source, id) {
   return source.find(function(item) {
      return item.id == id;
   });
  }

  getCheckCategory(id) {
    return this.findById(this.checkCategoryOptions, id);
  }

  getCheckCategoryOptions() {
    return this.checkCategoryOptions;
  }

  // Fills the checks array with the data in jsonObject and the id
  // from newCheckCategory
  fillAllChecks(jsonObject, id) {
    for(var el in jsonObject) {
      this.checks = jsonObject[el];
      break;
    }
    this.checkCategoryId = id;
  }

  emitChange() {
    this.emit(CHANGE_EVENT);
  }

  addChangeListener(callback) {
    this.on(CHANGE_EVENT, callback);
  }

  removeChangeListener(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  }

  handleActions(action) {
    switch(action.type) {
      case CheckConsts.CHANGE_CHECK_PROPERTY:
        this.setCurrentCheckProperty(action.propertyName, action.propertyValue);
        break;

      case CheckConsts.CHANGE_CHECK_CATEGORY:
        this.fillAllChecks(action.jsonObject, action.id);
        break;

      case CheckConsts.NEXT_CHECK:
        this.checkIndex++;
        // If there are no more checks in the group, go to the next group
        if(!this.getCurrentCheck()) {
          this.groupIndex++;
          this.checkIndex = 0;
        }
        this.emitChange();
        break;

      case CheckConsts.GO_TO_CHECK:
        this.groupIndex = action.groupIndex;
        this.checkIndex = action.checkIndex;
        break;

      // do nothing
      default:
        return;
    }
    this.emitChange();
  }

}

const checkStore = new CheckStore;
Dispatcher.register(checkStore.handleActions.bind(checkStore));
module.exports = checkStore;
window.checkStore = checkStore;
