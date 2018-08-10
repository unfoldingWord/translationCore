# English translationAcademy

## Overview

translationAcademy is intended to enable anyone, anywhere to equip themselves so that they will be able to make high-quality translations of biblical content into their own language. translationAcademy is designed to be highly flexible. It can be used in a systematic, in-advance approach or it can be used for just-in-time learning (or both, as needed). It is modular in structure.

translationAcademy was developed by the [Door43 World Missions Community](https://door43.org) in conjunction with [Wycliffe Associates](http://www.wycliffeassociates.org/).  The entire project is made
available under a [Creative Commons Attribution-ShareAlike 4.0 International License](http://creativecommons.org/licenses/by-sa/4.0), see the [LICENSE](https://git.door43.org/Door43/en_ta/src/master/LICENSE.md) file for more information.

Please use the [issue queue](https://git.door43.org/Door43/en_ta/issues) to provide feedback or suggestions for improvement.

## Resources

If you want to download English translationAcademy to use, go here: https://unfoldingword.org/academy/.  tA is also included in [tS](http://ufw.io/ts) and [tC](http://ufw.io/tc).

## Contributing or Translating

### Contributions are always welcomed. 
The translationAcademy is a collaborative work between several organzations. We seek those that would like to contribute to the work. Presently there is an Oversight Team that is responsible for the maintenance of the content. The members of this team represent various organizations and are experienced Biblical Scholars, Linguists and Bible Translators.
All contributions will be reviewed by the Oversight Team.

#### Submit an Issue
Submitting an issue is the preferred way to let the Oversight Team know of errors in the content. When you find an error, please note where the error is, if possible copy the error, open an [Issue](https://git.door43.org/Door43/en_ta/issues), paste in the error, then offer a correction, and then submit the Issue.

#### Pull Request
To contribute to the content of the translationAcademy please fork a copy of the repository, make your changes and then submit a Pull Request to the repository.
The Oversight Team will then review the PR and then decide on the merging of the content into the master repository.


### Explanation of the content file layout

Each manual has it's own directory in this repository (for example, the Checking Manual is in the checking directory). The content of the files are in a hybrid YAML/markdown format, beginning with a YAML header followed by the body of the article in markdown.

YAML is a markup language that is compact and easy to read. The YAML header bounded on the top and bottom by `---`. Each line within the header is a key-value pair, with the key and the value separated by a colon. Because the key is used by the publishing process, __it should never be translated or changed.__ Some of the values can be translated, and those are enumerated below in the instructions for translating.

Following the YAML header is the body of the article, which uses a format called "markdown." If you aren't familiar with markdown, you may find this [markdown tutorial](http://www.markdowntutorial.com/) helpful. Also, this README file, the one you are reading now, is written in markdown.

### Before you get started translating

* DO NOT RENAME ANY FILES. The name of the file is the same as the slug and is used to link the file to other files.

* If you do any translation work, be sure to put your name in the `manifest.yaml` file.
    * Left click on the file found in the root of the repository.
    * Click on the pencil icon to edit the file.
    * You will add the name(s) under the 'contributor' list heading (see line 5 and under)
    * Click on the end of line 7 (after 'Wycliffe Associates') and then press the enter key to start a new line.
    * Type in a dash then space then the name of a contributor between single quote marks.
    * Type in additional names as necessary.
    * Click on the green "Commit Changes" button at the bottom of the page to save the changes.

* The `LICENSE.md` file does not need to be translated or modified.
* The `README.md` does not need to be translated or modified.

### Images

Images that are included in tA should be no more than 600px wide.

### Instructions for translating translationAcademy

__The instructions for translating `meta.yaml` (metadata) and `toc.yaml` (table of contents) are included in the header of those files.__

The first step is to __fork this repository.__ When you do this, change the name of the repository to start with your language code rather than
`en`.

When translating the files for each manual:

* In the YAML header, you are free to translate the values following the `title`, `question` and `credits` keys. __DO NOT TRANSLATE THE KEYS__.
None of the other values should be translated. They contain slugs that are used to identify this article and to link it to other articles.

* Translating hyperlinks: Hyperlinks (links to other articles or to other pages on the internet) follow this pattern,

```
[text to display](http://www.example.com)
```

You can translate the "text to display" inside the square brackets but not the web address that follows inside the parentheses.

You are free to add additional pages. In order for the new page to be included when tA is published, all of the following conditions need to be satisfied:

1. You must create a directory in one of the manual directories (like the translate directory) that has the short name of the module you want to write.  For example, to create a new module on "testing" in the Translation Manual, you will want to put the file in "translate/testing/01.md".

1. The file must be included in the table of contents, `toc.yaml` for the appropriate manual.

1. The value of the slug in the YAML header and the file name (without the extension) must be the same as the directory name.

1. The slug must be unique, and not used in any of the other tA repositories. This is a requirement so that it is possible to create unambiguous links to articles in other tA manuals.

## Historical

If you would like to see the deprecated tranlsationAcademy pages in DokuWiki, go to https://dw.door43.org/en/ta.  You can still see the workbench pages at https://dw.door43.org/en/ta/workbench.
