# translationCore API Guide
## Features
### Actions
Actions are meant to help modules easily update their private data held in the store

Actions are used with the following functions:
#### *sendAction(action)*
This runs all actions that have been associated with a certain type. The parameter *action* is expected to be an Object with two keys:
* *field* - the same field used in *putDataInCheckStore()*. It is the tag associated with all of your modules' data in the CheckStore
* *type* - the same field used in *registerAction()*. It is the tag used to reference which action is being called.

If the parameter does not have these two fields, the function will **not** send the action and will instead exit silently.

If the action sends successfully, then every function that has been registered with the same *type* as *action.type* will be called one at a time, in the order in which they were registered.

#### *registerAction(type, callback)*  
This function adds a new action with the tag *type*. Now, when an action is called with *sendAction()*, any callback passed into *registerAction()* with the same *type* will be run.

The *callback* parameter is expected to receive a single parameter. This will be the data held in the store under the *field* set by the *sendAction()* call.

When passing the callback in, you should use *bind(this)* to ensure that the function does not lose its' scope

#### *removeAction(type, callback)*
This function removes an action previously registered with *registerAction()*. The parameters passed in should be the same that were used in *registerAction()*. This function will fail silently if the parameters passed in do not match a callback that was previously registered.

*removeAction()* should be called in a components' *componentWillUnmount()* to help with garbage collection.

### Events
The key idea behind events is that a module can register a callback function to a type of event, and when any component emits an event of that type, every callback function that has registered will be called asynchronously.

Their main use is to allow for asynchronous communication between the CheckStore and modules so that modules can listen for changes to data held in the CheckStore

Events have the following functions:

#### *registerEventListener(eventType, callback)*
This function takes in two parameters: *eventType*, a string, and *callback*, a function.

When a component registers a callback with a certain *eventType*, every time *emitEvent()* is called with that same *eventType*, that callback will run automatically.

This function should be called during a components' *componentWillMount()*.

There is no limit on how many listeners can listen for a type of event.

Whenever a callback is registered with this function in *componentWillMount()*, it should also be removed in *componentWillUnmount()* with *removeEventListener()*. If you do not do this, you may receive errors after switching between check types.

When you pass an object method in as a callback, it will need to be bound with *callback.bind(this)*

If you see an error concerning calling *setState()* on an unmounted component, it is likely that you have forgotten to remove a listener in your *componentWillUnmount()*

#### *emitEvent(event, params)*
This function takes two parameters: *event*, a string, and *params*, an object

When you call *emitEvent()*, every callback that has been registered with the same *eventType* as *event* will be called automatically. The *params* object will be passed in as an argument to every callback function.

Calling *emitEvent()* for an eventType with no listeners is completely safe

#### *removeEventListener(eventType, callback)*
This function removes a callback previously registered with *registerEventListener()*. The arguments passed in to this function should be the exact same that were passed in to the corresponding *registerEventListener()*. This is necessary to make sure that event listeners do not remain active for modules that have been unmounted by React

### Data

The CheckStore provides a way for the whole application to keep its state in a single place while still protecting your module's data from interference from other modules.

The CheckStore will also automatically save all of the data that you have put into it upon closing translationCore, and will automatically load it again when the application is restarted. You never have to handle manually writing your data to disk if you keep it in the CheckStore

The store allows you to store any data in key-value pairs (except functions, those can't really be saved to a file)

When using the majority of the functions that deal with data in the CheckStore, you must pass in *field* as a parameter. This is a string that designates a namespace for your data. This prevents modules from interfering with each other's data, since only your module knows what field it keeps its data in.

The CheckStore only has one reserved field: *common*. Data placed in common will be available to all modules across all check types. This field is meant for data that is likely to be used by everything in the application, such as the biblical text being checked or the original Greek text.

The API has the following functions for working with data in the checkstore:

#### *putDataInCheckStore(field, key, value)*
As apparent by the name, this function will place *value* (any data type) into your namespace *field* tagged with the *key*. This data can be retrieved later with *getDataFromCheckStore()*.

#### *getDataFromCheckStore(field, key)*
After you have put data into the store with *putDataInCheckStore()*, you can retrieve it with this function. If you pass in a value for *key*, it will retrieve the value tied to that key. If you do not, it will return all of the data you have stored in your *field* as an object. This function will return **null** if the field or key has no data associated with it.

This function returns a deep copy of you data, so modifying the return value will **not** change the value of the data held in the store. Only *putDataInCheckStore()* can modify data in the store.

#### *putDataInCommon(key, value)*
Puts a *value* in the CheckStore in the *common* field and tags it with the *key*. Any module can retrieve and change this data. You should only put data into common if it is meant to be mostly immutable data that every part of the application might need access to.

Data put into common is available at all times, even if the check type changes.

#### *getDataFromCommon(key)*
After putting data into *common* with *putDataInCommon()*, you can retrieve that data with this function. This function returns a deep copy of the data, so modifying the return value of this function will not modify the data held in common.

This function will return **null** if the key has no data associated with it.

### Miscellaneous

#### *convertToFullBookName(abbr)*
GOGS and Github tend to refer to books of the Bible with a three-letter identifier (2 Timothy is '2ti', Titus is 'tit', etc). This function will convert a three-letter abbreviation to the full book name. Currently only converts to English, will eventually convert to the gateway language you are working in.

#### *logCheckStore()*
This function logs *all* of the data held in the CheckStore to the console. Should be used for debugging purposes only, do not put in production code.
