# tC API

translationCore (tC) can be extended by tools using the [tC Tool library](https://github.com/translationCoreApps/tc-tool).

For a description of how these and additional props are made available within tools see [tC Tool Props](https://github.com/translationCoreApps/tc-tool/blob/master/TOOL_PROPS.md).

Below is a description of *some* properties inject into tools.

## Method Props

### writeProjectData

```js
writeProjectData(filePath, data): Promise
```

Writes data to a project's `.apps` folder given a relative file path.

### readProjectData

```js
readProjectData(filePath): Promise
```

Reads data from a project's `.apps` folder given a relative file path.

### readProjectDataSync

```js
readProjectDataSync(filePath)
```

A synchronous form of `readProjectData`.

### projectDataPathExists

```js
projectDataPathExists(filePath): Promise
```

Check if a path exists in a project's `.apps` folder given a relative file path.

### projectDataPathExistsSync

```js
projectDataPathExistsSync(filePath)
```

A synchronous form of `projectDataPathExists`.

### deleteProjectFile

```js
deleteProjectFile(filePath): Promise
```

Deletes a file from a project's `.apps` folder given a relative file path.

### showDialog

```js
showDialog(message, confirmText, cancelText): Promise
```

Displays a modal dialog with a message.
The promise will resolve when the dialog is closed.

### showLoading

```js
showLoading(message)
```

Displays an asynchronous loading dialog.

### closeLoading

```js
closeLoading()
```

Closes the asynchronous loading dialog.

## Data Props

### contextId
Provides information regarding the currently selected context.

### targetVerseText
The target language text of the currently selected verse.

### sourceVerse
The source language verse objects of the currently selected verse.

### targetChapter
The target language chapter objects of the currently selected chapter.

### sourceChapter
The source language chapter objects of the currently selected chapter.

### targetBook
The target language book

### sourceBook
The source language book

### appLanguage
The language selected for application localization.
