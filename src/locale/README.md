# translationCore Locale

The files in this directory represent the localized application strings.
For a detailed description of the library in use see [react-localize-redux](https://ryandrewjohnson.github.io/react-localize-redux/).

## Usage

In order to use locale within the application you must register it with a component.
This can be done with the decorator `@withLocale`.

> The decorator is importable from `src/components/Locale.js`.

Example:

```javascript 1.7
import {withLocale} from '../../Locale';

@withLocale
class MyComponent extends React.Component {
  
}
```

The decorator will the following props:

* `translate` - function for translating text
* `currentLanguage` - string containing the current language name

Then you can inject localized text into your component like `translate('home.login')`.
Or if your localized string contains variables:

```javascript 1.7
const greeting = translate('home.overview.greeting', {
  'app': translate('_.app_name')
})
```


## File Name Syntax

Files in this directory should be named in the following format.
Deviation from this format will prevent that locale from loading.

```text
  [Language Name]-[locale_REGION].json
  e.g.
  English-en_US.json
```

Files exported from the [Crowdin Project](https://crowdin.com/project/translationcore/)
will already be named in the correct format.

## Locale Equivalence

If the locale detected on the system does not have a matching translation the application may
instead load a translation that is a close match.

For example, if the detected system locale is `zh_SG` (Chinese - Singapore),
but such a translation file does not exist, the application will load the first `zh_*` translation available.

Furthermore, if no equivalent locale is found the application will lastly default to `en_US`.

## Non-Translatable Strings

In some cases the application may need a string that should not be localized.
However, for consistencies sake it would be nice to still access these strings through the locale api.

This is accomplished by enhancing translations when they are loaded.
Strings added in this manner are availabe in the `_` namespace.

These strings include:

* language_name
* app_name

 e.g. `translate('_.app_name')`
