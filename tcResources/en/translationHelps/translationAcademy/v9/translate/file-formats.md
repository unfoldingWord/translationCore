# File Formats #

### The Technical Nature of Translation

While a large part of translation has to do with language, words, and sentences, it is also true that a major aspect of translation is technical in nature. From creating alphabets, typing, typesetting, formatting, publishing, and distributing, there are many technical aspects to translation. In order to make all this possible, there are some standards that have been adopted.

### USFM: Bible Translation Format

For many years, the standard format for Bible translation has been USFM (which stands for Unified Standard Format Markers). We have adopted this standard as well.

USFM is a type of markup language that tells a computer program how to format the text. For instance, each chapter is marked like this ''\c 1'' or ''\c 33''. Verse markers might look like ''\v 8'' or ''\v 14''. Paragraphs are marked ''\p''. There are many other markers like this that have specific meaning. So a passage like John 1:1-2 in USFM will look like this:

    \c 1
    \p
    \v 1 In the beginning was the Word, and the Word was with God, and the Word was God.
    \v 2 This one, the Word, was in the beginning with God.

When a computer program that can read USFM sees this, it is able to format all of the chapter markers the same way (for instance, with a larger number) and all the verse numbers the same way (for instance, with a small superscript number).

***Bible translations must be in USFM for us to be able to use it!***

To read more about USFM notation, please read http://paratext.org/about/usfm .

#### How To Do a Bible Translation in USFM

Most people do not know how to write in USFM. This is one of the reasons why we created translationStudio (http://ufw.io/ts/). When you do a translation in translationStudio, what you see looks very similar to a normal word processor document without any markup language. However, translationStudio is formatting the Bible translation in USFM underneath what you see. This way, when you upload your translation from translationStudio, what is being uploaded is already formatted in USFM and can be immediately published in a variety of formats.

#### Converting a Translation to USFM

Though it is strongly encouraged to only do a translation using USFM notation, sometimes a translation is done without using USFM markup. This type of translation still can be used, but first the USFM markers must be added. One way to do this is to copy and paste it into translationStudio, then place the verse markers in the correct place. When this is done, the translation will be able to be exported as USFM. This is a very arduous task, so we strongly recommend doing your Bible translation work from the beginning in translationStudio or some other program that uses USFM.


### Markdown for Other Content

Markdown is a very common markup language that is used in many places on the Internet.  Using Markdown makes it very easy for the same text to be used in a variety of formats (such as webpage, mobile app, PDF, etc).

Markdown supports **bold** and *italic*, written like this:

        Markdown supports **bold** and *italic*.

Markdown also supports headings like this:

            # Heading 1
            ## Heading 2
            ### Heading 3

Markdown also supports links. Links display like this https://unfoldingword.org and are written like this:

            https://unfoldingword.org

Customized wording for links are also supported, like this:

            [uW Website](https://unfoldingword.org)

Note that HTML is also valid Markdown.  For a complete listing of Markdown syntax please visit http://ufw.io/md.

### Conclusion

The easiest way to get content marked up with USFM or Markdown is by using an editor that is specifically designed to do that. If a word processor or a text editor is used, these markings must be manually entered.

*Note: Making text bold, italic, or underlined in a word processor does not make it bold, italic, or underlined in a markup language. This type of formatting must be done by writing the designated symbols.*

When contemplating which software to use, please keep in mind that translation is not just about words; there are a lot of technical aspects that need to be taken into consideration. Whatever software is used, just remember that Bible translations need to be put into USFM, and everything else needs to be put into Markdown.