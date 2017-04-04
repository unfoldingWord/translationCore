import {loadSettings} from './loadMethods';
import {
  saveSettings,
  saveResources,
  saveComments,
  saveVerseEdit,
  saveSelections,
  saveReminders,
  saveGroupsIndex,
  saveGroupsData
} from './saveMethods';

/**
 * @description loads state needed to set up reducers with preloaded data
 * Takes in loadSettings()
 * @return {object} - preloaded state
 */
export const loadState = () => {
  try {
    const serializedState = {
      settingsReducer: loadSettings(),
      /**
       * @description this a temporary dummy data so that we can use to implement data persistence.
       */
      // commentsReducer: {
      //   text: 'hello world!',
      //   userName: 'manny',
      //   modifiedTimestamp: '2017-02-17T22:23:49.357Z'
      // },
      // remindersReducer: {
      //   enabled: true,
      //   userName: "klappy",
      //   modifiedTimestamp: "2017-02-17T22:23:49.357Z"
      // },
      // selectionsReducer: {
      //   selections: [
      //     {
      //       text: "സഹോദരന്മാരേ",
      //       occurrence: 1,
      //       occurrences: 1
      //     }
      //   ],
      //   userName: "klappy",
      //   modifiedTimestamp: "2017-02-17T22:23:49.357Z"
      // },
      // verseEditReducer: {
      //   before: "സഹോദരന്മാരേ, നിങ്ങളുടെ വിശ്വാസം ഏറ്റവും വർദ്ധിച്ചും നിങ്ങൾ ഓരോരുത്തർക്കും അന്യോന്യം സ്നേഹം പെരുകിയും വരികയാൽ ഞങ്ങൾ ഉചിതമാകുംവണ്ണം ദൈവത്തിന്നു എപ്പോഴും നിങ്ങളെക്കുറിച്ചു സ്തോത്രം ചെയ്‌വാൻ കടപ്പെട്ടിരിക്കുന്നു.",
      //   after: "സഹോദ-രന്മാരേ, നിങ്ങളുടെ വിശ്വാസം ഏറ്റവും വർദ്ധിച്ചും നിങ്ങൾ ഓരോരുത്തർക്കും അന്യോന്യം സ്നേഹം പെരുകിയും വരികയാൽ ഞങ്ങൾ ഉചിതമാകുംവണ്ണം ദൈവത്തിന്നു എപ്പോഴും നിങ്ങളെക്കുറിച്ചു സ്തോത്രം ചെയ്‌വാൻ കടപ്പെട്ടിരിക്കുന്നു.",
      //   tags: [],
      //   userName: "klappy",
      //   modifiedTimestamp: "2017-02-17T22:23:49.357Z"
      // },
      contextIdReducer: {
        contextId: {
          reference: {
            bookId: '2th',
            chapter: 1,
            verse: 6
          },
          tool: 'ImportantWords',
          groupId: 'afflict',
          quote: 'affliction',
          occurrence: 1
        }
      },
      groupsIndexReducer: {
        groupsIndex: [
          {id: 'afflict', name: 'afflict, affliction'},
          {id: 'authority', name: 'authority, authorities'},
          {id: 'avenge', name: 'avenge, revenge, vengeance'}
        ]
      },
      groupsDataReducer: {
        groupsData: {
          afflict: [
            {
              "priority": 1,
              "contextId": {
                "reference": {
                  "bookId": "2th",
                  "chapter": 1,
                  "verse": 6
                },
                "tool": "ImportantWords",
                "groupId": "afflict",
                "quote": "affliction",
                "occurrence": 1
              }
            },
            {
              "priority": 1,
              "contextId": {
                "reference": {
                  "bookId": "2th",
                  "chapter": 1,
                  "verse": 6
                },
                "tool": "ImportantWords",
                "groupId": "afflict",
                "quote": "afflict",
                "occurrence": 1
              }
            }
          ],
          authority: [
            {
              "priority": 1,
              "contextId": {
                "reference": {
                  "bookId": "2th",
                  "chapter": 3,
                  "verse": 9
                },
                "tool": "ImportantWords",
                "groupId": "authority",
                "quote": "authority",
                "occurrence": 1
              }
            }
          ],
          avenge: [
            {
              "priority": 1,
              "contextId": {
                "reference": {
                  "bookId": "2th",
                  "chapter": 1,
                  "verse": 8
                },
                "tool": "ImportantWords",
                "groupId": "avenge",
                "quote": "vengeance",
                "occurrence": 1
              }
            }
          ]
        }
      }
    };
    if (serializedState === null) {
      //  returning undefined to allow the reducers to initialize the app state
      return undefined;
    }
    return serializedState;
  } catch (err) {
    // not using console.error because in some cases we still want the app to continue
    // and by makin it undefined the reduecrs will be ibitialized with its default state.
    console.warn(err);
    //  returning undefined to allow the reducers to initialize the app state
    return undefined;
  }
};

/**
 * @description saves state to the filesystem on state change
 * Takes in saveSettings()
 * @param {object} state - object of reducers (objects).
 */
export const saveState = state => {
  try {
    saveSettings(state);
    saveResources(state);
    saveComments(state);
    saveSelections(state);
    saveVerseEdit(state);
    saveReminders(state);
    saveGroupsIndex(state);
    saveGroupsData(state);
  } catch (err) {
    console.warn(err);
  }
};
