<img src='https://raw.githubusercontent.com/unfoldingWord/translationCore/develop/src/images/TC_Icon.png' height="205px" width="210px" alt='translationCore Logo'>

# translationCore

![](https://github.com/unfoldingWord/translationCore/workflows/Node%20CI/badge.svg?branch=develop)
[![Releases](https://img.shields.io/github/downloads/unfoldingword/translationCore/total.svg)](https://github.com/unfoldingWord/translationCore/releases)
[![Current Verison](https://img.shields.io/github/tag/unfoldingword/translationCore.svg)](https://github.com/unfoldingWord/translationCore/tags)
[![codecov](https://codecov.io/gh/unfoldingWord/translationCore/branch/develop/graph/badge.svg)](https://codecov.io/gh/unfoldingWord/translationCore)

Purpose
---
translationCore is an open source platform for checking and managing Bible translation projects. tC provides an extensible interface that enables, among other things, systematic and comprehensive checking of Bible translations against multiple sources and the original languages with just-in-time training modules that provide guidelines and instruction for translators.

Usage
---
Currently translationCore supports Bible Translation Projects started with [translationStudio](https://unfoldingword.org/ts/) and uploaded to [Door43](https://git.door43.org/), and with limited support for USFM projects created using other tools.

For more information see page for usage: [Usage](https://github.com/unfoldingWord/translationCore/wiki/Usage)

Contributions
---
We warmly welcome contributions to both the translationCore repository and building of new checking modules that fit the needs of the Global Church and Church Networks actively translating the Bible.

For more information see page for contributors: [Contributing](https://github.com/unfoldingWord/translationCore/wiki/Contributing)

Localization
---
This application is been localized into a number of languages.
You can view progress or help translate at [Crowdin](https://crowdin.com/project/translationcore).

Code Documentation
---

You can read the documented code at [docs.tc.unfoldingword.surge.sh](http://docs.tc.unfoldingword.surge.sh/).

Debugging Main App
---
- first time do: `npm run load-apps`
- launch app by: `npm i --legacy-peer-deps && npm run start` or in windows run `npm i --legacy-peer-deps; npm run start`
- after you get to the "Get Started" Page you can launch Chromium debugger by:
  - on Mac doing Command-Option-I
  - on Windows or Linux do Control-Shift-I

Debugging App Startup Code
---
- first time do: `npm run load-apps`
- launch app by: `npm i --legacy-peer-deps && npm run start-debug`
- open chrome to url `chrome://inspect/#devices`
- if you do not see under remote target `electron/js2c/browser_init` add an `inspect` link, make sure `Discover network targets` is selected and click `Configure` button.  Make sure `localhost:5656` is added under `Target discovery settings` and click `Done`.
- Under remote target `electron/js2c/browser_init` click on `inspect` link.
- You will need to add the folder that contains the translationCore source files to the workspace.  Then you can use control-P or command-P to search for and open source files and set breakpoints.
  - the electronite app initialization code is in `electronite/index.js`
  - the app UI startup code is in `pages/app.js` but cannot debug with this method, but will have to use debugger in the app and do a reload.

