===== File Formats =====

//This answers the question:// //What file formats are acceptable?//

==== The Technical Nature of Translation ====

While a huge part of translation has to do with language, words, and sentences, it is also true that a major aspect of translation is technical in nature. From creating alphabets, typing, typesetting, formatting, publishing, and distributing, there are many technical aspects to translation. In order to make all this possible, there are some standards that have been adopted. 

==== USFM: Bible Translation Format ====

For many years, the de facto standard format for Bible translation has been USFM (which stands for Unified Standard Format Markers). We have adopted this standard as well. 

USFM is a type of markup language that tells a computer program how to format the text. For instance, each chapter is marked like this ''\c 1'' or ''\c 33''. Verse markers might look like ''\v 8'' or ''\v 14''. Paragraphs are marked ''\p''. There are many other markers like this that have specific meaning. So a passage like John 1:1-3 in USFM will look like this: 

  \s5
  \c 1
  \p
  \v 1 In the beginning was the Word, and the Word was with God, and the Word was God.
  \v 2 This one, the Word, was in the beginning with God.
  \v 3 All things were made through him, and without him there was not one thing made that has been made.

When a computer program that can read USFM sees this, it is able to format all of the chapter markers the same way (for instance, with a larger number) and all the verse numbers the same way (for instance, with a small superscript number). 

**//Bible translations must be in USFM for us to be able to use it!//**

To read more about USFM notation please read http://paratext.org/about/usfm .

=== How To Do a Bible Translation in USFM ===

Most people do not know how to write in USFM. This is a huge reason why we created translationStudio. If you do a Bible translation in translationStudio what you see looks very similar to a normal word processor document without any markup language. But what translationStudio is doing underneath what you see, is formatting the Bible translation into USFM. This way, when you upload your translation from translationStudio, what is being uploaded is already formatted in USFM and can be immediately used on the unfoldingWord website and mobile app.

=== Converting a Translation to USFM ===

Though it is strongly encouraged to only do a translation using USFM notation, sometimes a translation is done without using USFM markup. This type of translation still can be used, but first the USFM markers must be added. The simplest way to do this is to copy and paste it into translationStudio, then place the verse markers in the correct place. When this is done, the translation will be able to be exported as USFM. This is a very arduous task, so we strongly recommend doing your Bible translation work from the beginning in translationStudio or some other program that uses USFM. 

==== Format for Biblical Content ====

At the time of writing, Door43 is in the middle of a transition from DokuWiki formatting to Markdown formatting. For the foreseeable future, both markup styles will be accepted with Markdown being the preferred format.

=== Markdown ===

Markdown is a very common markup language. It also uses symbols like DokuWiki does, but the symbols are a little different. 

For instance, "Markdown supports **bold** and //italic//." But that is written
  Markdown supports **bold** and *italic*.

Markdown also supports headings. Headings are written like this:  
  # Heading 1
  ## Heading 2
  ### Heading 3

Markdown also supports links. Links display like this https://unfoldingword.org and are written like this:
  https://unfoldingword.org

Customized wording for links are also supported, like "[[en:ta|this]]". It is written like this:
  [this](https://unfoldingword.org)

By using Markdown, it makes it very easy for the same formatting to appear in a webpage, on a mobile app, and in a PDF. 

//Note: HTML is valid in Markdown.//

For a complete listing of Markdown notation please visit https://daringfireball.net/projects/markdown/syntax .

==== Conclusion ====

The easiest way to get content marked up with USFM, DokuWiki, or Markdown is by using an editor that is specifically designed to do that. If a word processor or a text editor is used, these markings must be manually entered. 

//Note: Making text bold, italic, or underlined in a word processor does not make it bold, italic, or underlined in a markup language. This type of formatting must be done by writing the designated symbols.//

When contemplating which software to use, please keep in mind that translation is not just about words; there are a lot of technical aspects that need to be taken into consideration. Whatever software is used, just remember that Bible translations need to be put into USFM, and everything else needs to be put either into DokuWiki or Markdown formatting. 






