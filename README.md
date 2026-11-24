<img src='https://raw.githubusercontent.com/unfoldingWord/translationCore/develop/src/images/TC_Icon.png' height="205px" width="210px" alt='translationCore Logo'>

# translationCore

![](https://github.com/unfoldingWord/translationCore/workflows/Node%20CI/badge.svg?branch=develop)
[![Releases](https://img.shields.io/github/downloads/unfoldingword/translationCore/total.svg)](https://github.com/unfoldingWord/translationCore/releases)
[![Current Version](https://img.shields.io/github/tag/unfoldingword/translationCore.svg)](https://github.com/unfoldingWord/translationCore/tags)
[![codecov](https://codecov.io/gh/unfoldingWord/translationCore/branch/develop/graph/badge.svg)](https://codecov.io/gh/unfoldingWord/translationCore)

tools for translators


## Purpose

translationCore is an open source platform for checking and managing Bible translation projects. tC provides an extensible interface that enables, among other things, systematic and comprehensive checking of Bible translations against multiple sources and the original languages with just-in-time training modules that provide guidelines and instruction for translators.

## Usage

Currently, translationCore supports Bible Translation Projects started with [translationStudio](https://unfoldingword.org/ts/) and uploaded to [Door43](https://git.door43.org/), and with limited support for USFM projects created using other tools.

For more information see page for usage: [Usage](https://github.com/unfoldingWord/translationCore/wiki/Usage)

## Contributions

We warmly welcome contributions to both the translationCore repository and building of new checking modules that fit the needs of the Global Church and Church Networks actively translating the Bible.

For more information see page for contributors: [Contributing](https://github.com/unfoldingWord/translationCore/wiki/Contributing)

## Localization

This application has been localized into a number of languages.
You can view progress or help translate at [Crowdin](https://crowdin.com/project/translationcore).

### Changing localized strings (developers)

1. Add or change strings only in `src/locale/English-en_US.json`. In code, use `translate('section.key')` with a literal key.
2. Run `npm run find:missing-locale` to find keys used in `src/js` that aren't in the English file. Run `npm run find:extra-locale` to find English keys that no code uses.
3. Run `npm run locales:tc-copy-missing` to copy new keys into the other `src/locale/*.json` files. They get the English text until Crowdin translates them.
   - For the checking tools, use `locales:wa-copy-missing`, `locales:tw-copy-missing` or `locales:tn-copy-missing`. These change the tool's submodule, so commit there.
   - `npm run locales:update-all` runs all four.
   - `npm run locales:do-compare` only reports missing and extra keys.
4. Commit the locale files, but not the `locale-check-*.log` files the scripts write to the repo root.

## Documentation

### JS-Docs generated documentation:
- last deployed on GitHub pages: [deployed JS-Docs](https://unfoldingword.github.io/translationCore/translationCore/index.html)
- current local: [local JS-Docs](./docs/translationCore/index.html)


## Building app locally
- Use Node 16 (`>=16.14.0 <16.15`). With newer Node versions, the React build fails with `ERR_OSSL_EVP_UNSUPPORTED`.
- example to build the app for mac: `npm i --legacy-peer-deps && npm run build-macos`
  - or do `build-win` or `build-linux`
  - the build downloads the pinned llama-server (`llamaCppTag` in `package.json`) and bundles it in the app
- then to create installer for MacOS: `./node_modules/.bin/gulp release-macos-universal --out=artifacts/universal/tCore-macos-universal.dmg`
- Files the main process loads by path, such as preload scripts, aren't bundled by webpack. Add them to the copy list in `craco.config.js`, or the packaged app can't find them.


## Debugging Main App

- first time do: `npm run load-apps`
- launch app by: `npm i --legacy-peer-deps && npm run start` or in windows run `npm i --legacy-peer-deps; npm run start`
- after you get to the "Get Started" Page you can launch Chromium debugger by:
  - on Windows or Linux do Control-Shift-I
  - on Mac doing Command-Option-I

## AI Suggestions and the Local AI Server

translationCore can get AI suggestions from an OpenAI-compatible server (such as LM Studio), or from a llama-server bundled with the app.

- **Models:** the bundled server uses the `.gguf` models in `~/translationCore/models`. Use **Actions → Check for model updates** to download missing or changed models from the [AI models release](https://github.com/unfoldingWord/checking-tool-wrapper/releases/tag/v0.9.0-beta). The list also includes [Qwen3-4B-Instruct-2507 Q4_K_M](https://huggingface.co/lmstudio-community/Qwen3-4B-Instruct-2507-GGUF), which is hard-coded in `EXTRA_MODELS` in `electronite/modelUpdater.js`.
- **Development:** run `npm run fetch-llama-server` once to download llama-server into `vendor/llama-server/`. Without it, the local server reports `available: false`.
- **Testing from the console:** open the developer tools in the main window and run:

```js
await AiAPIs.localServer.getStatus();                    // available: true
await AiAPIs.getAvailableModels({ localServer: true });  // the models in ~/translationCore/models
await AiAPIs.query('Reply with the single word: hello', {
  localServer: true,
  model: 'uw-tw-qwen3-0.6b-Q6_K', // model id = .gguf file name without the extension
});                                                      // { replyText, reasoningText, actualModel }
await AiAPIs.localServer.stop();
```

- llama-server only scans the models folder when it starts. If you add or remove a model by hand while it's running, run `await AiAPIs.localServer.stop()`. The next query starts it again with the new list. Downloads from "Check for model updates" do this automatically.

See `CLAUDE.md` and `plan/embed-llama-server.md` for details.

## Debugging App Startup Code

- first time do: `npm run load-apps`
- launch app by: `npm i --legacy-peer-deps && npm run start-debug`
- open chrome to url `chrome://inspect/#devices`
- if you do not see under remote target `electron/js2c/browser_init` and an `inspect` link,
  make sure `Discover network targets` is selected and click `Configure` button.  Make sure `localhost:5656` is added under `Target discovery settings` and click `Done`.
- Under remote target `electron/js2c/browser_init` click on `inspect` link.

## Developer Notes

- **translationCore Startup:**
  - Electronite starts up calling electronite/index.js
    - Creates a splash window using public/splash.html until MainWindow is ready to show
    - MainWindow created in electronite/electronWindows.js loading public/index.html
      - Startup then goes:
        - src/js/pages/index.js
        - src/js/pages/root.js
        - In src/js/pages/app.js Main component initializes calling:
          - loadLocalization()
          - loadTools();
          - src/js/actions/MigrationActions.js - migrateResourcesFolder() - all the resource updates happen here
            } Calls moveResourcesFromOldGrcFolder() and getMissingResources()
          - migrateToolsSettings();


- **Starting App:** shows WelcomeSplash which waits for user to click `"Get Started!"` button.


- **Select Project:** src/js/actions/MyProjects/ProjectLoadingActions.js - openProject - initializes tools
  - Calls src/js/helpers/ResourcesHelpers.js - copyGroupDataToProject() - which copies from resource data to project index.
    - calls project.hasNewGroupsData()
  - src/js/helpers/ResourcesHelpers.js - migrateOldCheckingResourceData() - iterates through project index data to make sure it is up to date with records in checkData
  - connectToolApi() - prepares properties to send to tool


- **Tool Card:**
  - For GL selection see src/js/components/home/toolsManagement/ToolCard.js - selectionChange()
    - Calls src/js/actions/ProjectDetailsActions.js - setProjectToolGL()


- **Launching Tools:** UI calls src/js/actions/ToolActions.js - openTool()
  - Which calls `dispatch({type:types.OPEN_TOOL,name});` and then `BodyUIActions.toggleHomeView(false)` which enables ToolContainer


- **Passing Data to Tool:**
  - Calls ProgramLoadingActions.connectToolApi() which calls:
    - ProgramLoadingActions.makeToolProps() to load data to transfer to tool
    - tool.api.triggerWillConnect() to transfer data to tools


- **How tCore determines Valid Gateway Language selections to Tools**
  - tC Calls gatewayLanguageHelpers.getGatewayLanguageList() to get list of GLs/owners that meet the requirements for a tool.
    - See getGlRequirementsForTool() for requirements:

    - Requirements to show up in GL list:
      - tN: for language to show up as a GL option in tN tool - needs original language, tA, aligned bible (which includes current book)
        - GL needs:
          - Aligned Bible with minimum checking level 3, and current book must be present and aligned
          - tA
          - tN

        - OrigLang
          - Bible with minimum checking level 2

      - tW: for language to show up as a GL option in tW tool -  original language, needs aligned bible (which includes current book)
        - GL needs:
          - Aligned Bible with minimum checking level 3, and current book must be present and aligned
          - tW with minimum checking level 2
          - tWL if owner not door43-Catalog

        - OrigLang
          - Bible with minimum checking level 2
          - tW

      - WA: for language to show up as a GL option in wA tool - needs:
        - GL needs:
          - Bible with minimum checking level 3, and current book must be present and aligned
          - Lexicon (even if only en is available) - not usually an issue unless the en lexicon was accidently deleted from build

        - OrigLang
          - Bible with minimum checking level 2


- **Troubleshooting Missing Gateway Language Selections**
  - check the tCore logs (either from console or )
  - there will be log entries such as below. This example indicates that the checking level is not high enough (see notes above for required checking levels for each tool).


```
isValidResource() - /Users/blm0/translationCore/resources/bn/bibles/glt/v4_translationCore-Create-BCS, gal - invalid, manifest missing = false, book missing = false, insufficient checking level = true
getValidGatewayBibles() - For owner translationCore-Create-BCS, glt, bn, gal - is NOT a VALID aligned bible for wordAlignment, isBibleValidSource = true, missingBook = false, missingAlignments = false
```


- **Available Bibles in Tools**
  - Tc-ui-toolkit calls getAvailableScripturePaneSelections() - to get list of resources to add (find call to `resourceList.push(resource);` in tCore).  This creates array of objects in format:

```
  resource = {
    bookId,
    bibleId,
    languageId,
    manifest,
    owner,
  };
```


- When new bible selected:
  - ScripturePane.addNewBibleResource() calls makeSureBiblesLoadedForTool() to make sure bibles are loaded
  - This is mapped to dispatch in ToolContainer in tCore, and each tool passes the function to ScripturePane in ScripturePaneContainer
