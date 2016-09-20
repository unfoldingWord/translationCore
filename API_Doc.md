# translationCore API Guide
## Overview
This guide will help you create your own plugin for translationCore. Although translationCore is tailored for plugins made for checking Bible translations, it can support other types of plugins as well. The API is general enough for almost any kind of app to be plugged in to the tC system.

### Necessary Files
A plugin must be contained in a folder consisting of at least the following three files:
* View.js
* FetchData.js
* ReportView.js

##### View.js
This is your user interface in translationCore. This file's main export is a React component (https://facebook.github.io/react/).

##### FetchData.js
This is where you give us your data. This file's export is a function which should pass your data to a callback function.

##### ReportView.js
This is how your data is displayed in a report. This file's export is a function that returns JSX (very similar to a React component).

For more information on these files, see our example check modules.

### CheckStore
CheckStore is where all of your data is held in memory. Any data you store should go here. You don't need to handle saving to disk -- we do all of that for you.

Our API contains functions to interact with the CheckStore, like getting and setting data.


## Features

### Events
A module can register a callback function -- let's say: doSomething() -- to a type of event -- say: 'buttonClick.' Now when that event ('buttonClick') fires, every callback function that has registered to that event will be called asynchronously.

Their main use is to allow for asynchronous communication between the CheckStore and modules so that modules can listen for changes to data held in the CheckStore.

Events have the following functions:

#### `registerEventListener(eventType, callback)`
This function takes in two parameters: *eventType*, a string, and *callback*, a function.

When a component registers a callback with a certain *eventType*, every time `emitEvent()` is called with that same *eventType*, that callback will run automatically.

The callback function should take one parameter called *params*.

`registerEventListener` should be called during a components' `componentWillMount()`.

There is no limit on how many listeners can listen for a type of event.

Whenever a callback is registered with this function in `componentWillMount()`, it should also be removed in `componentWillUnmount()` with `removeEventListener()`. If you do not do this, you may receive errors after switching between check types.

When you pass an object method in as a callback, it will need to be bound with `callback.bind(this)`

If you see an error concerning calling `setState()` on an unmounted component, it is likely that you have forgotten to remove a listener in your `componentWillUnmount()`

```javascript
constructor() {
  this.handleButtonClicked = this.handleButtonClicked.bind(this);
}
componentWillMount() {
  api.registerEventListener('buttonClicked', this.handleButtonClicked);
}
handleButtonClicked(params) {
  // this code will run after the 'buttonClicked' event is fired
}
```

#### `emitEvent(event, params)`
This function takes two parameters: *event*, a string, and *params*, an object

When you call `emitEvent()`, every callback that has been registered with the same *eventType* as *event* will be called automatically. The *params* object will be passed in as an argument to every callback function.

Calling `emitEvent()` for an eventType with no listeners is completely safe.

```javascript
api.emitEvent('buttonClicked', {'status': 'CORRECT'});
```

#### `removeEventListener(eventType, callback)`
This function removes a callback previously registered with `registerEventListener()`. The arguments passed in to this function should be the exact same that were passed in to the corresponding `registerEventListener()`. This is necessary to make sure that event listeners do not remain active for modules that have been unmounted by React.

```javascript
componentWillUnmount() {
  api.removeEventListener('eventTypeHere', this.callbackFunction);
}
```

### Data

The CheckStore provides a way for the whole application to keep its state in a single place while still protecting your module's data from interference from other modules.

The CheckStore will also automatically save all of the data that you have put into it upon closing translationCore, and will automatically load it again when the application is restarted. You never have to handle manually writing your data to disk if you keep it in the CheckStore.

The store allows you to store any data in key-value pairs (except functions, those can't really be saved to a file).

When using the majority of the functions that deal with data in the CheckStore, you must pass in *field* as a parameter. This is a string that designates a namespace for your data. This prevents modules from interfering with each other's data, since only your module knows what field it keeps its data in.

The CheckStore only has one reserved field: *common*. Data placed in common will be available to all modules across all check types. This field is meant for data that is likely to be used by everything in the application, such as the biblical text being checked or the original Greek text.

The API has the following functions for working with data in the Checkstore:

#### `putDataInCheckStore(field, key, value)`
As apparent by the name, this function will place *value* (any data type) into your namespace *field* tagged with the *key*. This data can be retrieved later with `getDataFromCheckStore()`.

```javascript
api.putDataInCheckStore('TranslationWordsChecker', 'checkStatus', 'CORRECT');
```

#### `getDataFromCheckStore(field, key)`
After you have put data into the store with `putDataInCheckStore()`, you can retrieve it with this function. If you pass in a value for *key*, it will retrieve the value tied to that key. If you do not, it will return all of the data you have stored in your *field* as an object. This function will return **null** if the field or key has no data associated with it.

```javascript
var myCheckStatus = api.getDataFromCheckStore('TranslationWordsChecker', 'checkStatus');
```

#### `putDataInCommon(key, value)`
Puts a *value* in the CheckStore in the *common* field and tags it with the *key*. Any module can retrieve and change this data. You should only put data into common if it is meant to be mostly immutable data that every part of the application might need access to.

Data put into common is available at all times, even if the check type changes.

```javascript
api.putDataInCommon('gatewayLanguage', 'Jesus wept');
```

#### `getDataFromCommon(key)`
After putting data into *common* with `putDataInCommon()`, you can retrieve that data with this function. This function will return **null** if the key has no data associated with it.

```javascript
var originalLanguageText = api.getDataFromCommon('originalLanguage');
```

### Miscellaneous

#### `convertToFullBookName(abbr)`
GOGS and Github tend to refer to books of the Bible with a three-letter identifier (2 Timothy is '2ti', Titus is 'tit', etc). This function will convert a three-letter abbreviation to the full book name. Currently only converts to English, will eventually convert to the gateway language you are working in.

```javascript
var ephesiansFullBookName = api.convertToFullBookName('eph');
```

#### `logCheckStore()`
This function logs *all* of the data held in the CheckStore to the console. Should be used for debugging purposes only, do not put in production code.

```javascript
api.logCheckStore();
```
