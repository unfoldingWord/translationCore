# tC API

translationCore (tC) can be extended by tools using the [tC Tool library](https://github.com/translationCoreApps/tc-tool).

Below is a description of *some* methods made available to the tool's props.

## writeProjectData

```js
writeProjectData(filePath, data): Promise
```

Writes data to a project's `.apps` folder given a relative file path.

## readProjectData

```js
readProjectData(filePath): Promise
```

Reads data from a project's `.apps` folder given a relative file path.

## readProjectDataSync

```js
readProjectDataSync(filePath)
```

A synchronous form of `readProjectData`.

## projectFileExistsSync

```js
projectFileExistsSync(filePath)
```

Check if a file exists in a project's `.apps` folder given a relative file path.

## deleteProjectFile

```js
deleteProjectFile(filePath): Promise
```

Deletes a file from a project's `.apps` folder given a relative file path.

## showDialog

```js
showDialog(message, confirmText, cancelText): Promise
```

Displays a modal dialog with a message.
The promise will resolve when the dialog is closed.

## showLoading

```js
showLoading(message)
```

Displays an asynchronous loading dialog.

## closeLoading

```js
closeLoading()
```

Closes the asynchronous loading dialog.
