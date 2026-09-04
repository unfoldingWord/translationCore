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

## Documentation

### JS-Docs generated documentation:
- last deployed on GitHub pages: [deployed JS-Docs](https://unfoldingword.github.io/translationCore/translationCore/index.html)
- current local: [local JS-Docs](./docs/translationCore/index.html)


## Building app locally
- example to build the app for mac: `npm i --legacy-peer-deps && npm run build-macos`
  - or do `build-win` or `build-linux`
- then to create installer for MacOS: `./node_modules/.bin/gulp release-macos-universal --out=artifacts/universal/tCore-macos-universal.dmg`


## Debugging Main App

- first time do: `npm run load-apps`
- launch app by: `npm i --legacy-peer-deps && npm run start` or in windows run `npm i --legacy-peer-deps; npm run start`
- after you get to the "Get Started" Page you can launch Chromium debugger by:
  - on Windows or Linux do Control-Shift-I
  - on Mac doing Command-Option-I

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
