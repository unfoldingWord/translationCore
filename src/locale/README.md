# translationCore Locale

The files in this directory represent the localized application strings.

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
