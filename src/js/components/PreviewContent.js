import React, {
  useState,
  useEffect,
  useMemo,
} from 'react';
import {
  useProskomma,
  useImport,
  useCatalog,
  useRenderPreview,
} from 'proskomma-react-hooks';
import fs from 'fs-extra';
import path from 'path-extra';
import { getLanguageByCode } from '../helpers/LanguageHelpers';
import { isNewTestament } from '../helpers/bibleHelpers';
import { ALL_BIBLE_BOOKS } from '../common/BooksOfTheBible';
import { ASSETS_PATH, isProduction } from '../common/constants';
// import { JS_DIR } from '../common/constants';

const i18n_default = {
  // coverAlt: "Cover",
  titlePage: 'unfoldingWord Literal Translation: Preview',
  copyright: 'Licensed under a Creative Commons Attribution-Sharealike 4.0 International License',
  // preface: "Preface",
  tocBooks: 'Books of the Bible',
  ot: 'Old Testament',
  nt: 'New Testament',
  // notes: "Notes",
};

// fix the HTML for tCore preview
function convertPrintPreviewHtml(html, projectFont) {
  let publicBase;

  if (isProduction) {
    publicBase = path.join(__dirname);
  } else { // running in development
    // --dirname in development is in ./node_modules/electronite/dist/Electron.app/Contents/Resources/electron.asar/renderer
    publicBase = path.join(__dirname, '../../../../../../../../public');
  }

  let html_ = html;
  const pagedPath = path.join(publicBase, './js/paged.polyfill.js');
  const previewStyleTemplate = fs.readFileSync(path.join(ASSETS_PATH, 'previewTemplate.css'), 'utf8');
  const startStyleStr = '<style>';
  const startStyle = html.indexOf(startStyleStr);
  const endStyleStr = '</style>';
  const endStyle = html.indexOf(endStyleStr, startStyle);

  if ((startStyle >= 0) && (endStyle >= 0)) {
    const firstPart = html.substring(0, startStyle + startStyleStr.length);
    const lastPart = html.substring(endStyle);
    html_ = firstPart + '\n' + previewStyleTemplate + '\n' + lastPart;
  }

  try {
    let headerPrefix = '';

    if (!projectFont) {
      projectFont = 'default';
    }

    const styleName = `previewStyles-${projectFont}.css`;
    const cssPath = path.join(publicBase, styleName);
    const cssLink = `<link rel="stylesheet" href="file://${cssPath}">\n`;
    headerPrefix += cssLink;

    // replace call to external js with local file load and insert path to stylesheet
    html_ = html_.replace('<script src="https://unpkg.com/pagedjs/dist/paged.polyfill.js">', `${headerPrefix}\n<script src="file://${pagedPath}">`);
    return html_;
  } catch (e) {
    console.log(`convertPrintPreviewHtml() - could not read ${pagedPath}`);
    console.log(`convertPrintPreviewHtml() - __dirname = ${__dirname}`);
    let dirPath = path.join(__dirname, '..');
    let files = fs.readdirSync(dirPath);
    console.log(`at ${dirPath}`, files);
    dirPath = path.join(__dirname);
    files = fs.readdirSync(dirPath);
    console.log(`at ${dirPath}`, files);
  }
}

function PreviewContent({
  // eslint-disable-next-line react/prop-types
  bookId, onRefresh, usfm, onError, onProgress, languageId, typeName, printImmediately, projectFont,
}) {
  const [submitPreview, setSubmitPreview] = useState(!!printImmediately);
  const [documents, setDocuments] = useState([]);
  const [i18n, setI18n] = useState(i18n_default);

  const language = useMemo(() => {
    const lang_ = getLanguageByCode(languageId);
    return lang_;
  }, [languageId]);

  const verbose = true;
  const proskommaHook = useProskomma({ verbose });

  const importHook = useImport({
    ...proskommaHook,
    documents: documents,
    ready: documents.length && proskommaHook?.proskomma,
    verbose,
  });

  const catalogHook = useCatalog({
    ...proskommaHook,
    cv: !importHook.importing,
    verbose,
  });

  const structure = { ot: [], nt: [] };

  if ( isNewTestament(bookId) ) {
    structure.nt = [bookId];
  } else {
    structure.ot = [bookId];
  }

  const docSetId = catalogHook?.catalog?.docSets?.[0]?.id;
  const textDirection = language?.ltr ? 'ltr' : 'rtl';
  const ready = submitPreview && i18n?.title;
  const {
    html, // dummy output (currently <html><head>...</head><body>...</body></html>)
    running, // dummy timer for simulating false, true, false.
    // eslint-disable-next-line no-unused-vars
    progress, // dummy 0...50...100
    // eslint-disable-next-line no-unused-vars
    errors, // caught and floated up
  } = useRenderPreview({
    ...proskommaHook,
    docSetId, // docset provides language and docSetId to potentially query, and build structure
    textDirection,
    structure, // eventually generate structure from catalog
    i18n,
    language: languageId,
    ready, // bool to allow render to run, don't run until true and all content is present
    verbose,
  });

  useEffect(() => {
    if (errors?.length) {
      console.warn(`PreviewContent() - error rendering bible`, errors);
      onError && onError(errors);
    }
  }, [errors, onError]);

  useEffect(() => {
    if (progress) {
      onProgress && onProgress(progress);
    }
  }, [progress, onProgress]);

  useEffect(() => {
    if (html && submitPreview && !running) {
      const html_ = convertPrintPreviewHtml(html, projectFont);
      onRefresh && onRefresh(html_);
      setSubmitPreview(false);
    }
  }, [html, submitPreview, running, projectFont, onRefresh]);

  useEffect(() => {
    if ( !submitPreview ) {
      return;
    }

    function doSubmitPreview() {
      // eslint-disable-next-line no-unused-vars
      let errorCode;
      // eslint-disable-next-line no-unused-vars
      let _errorMessage = null;
      let content = usfm;

      if (content) {
        // create the preview
        const owner = 'Local'; // TODO what owner?
        const document = ({
          bookCode, bookName, testament,
        }) => ({
          selectors: {
            org: owner, lang: languageId, abbr: bookCode,
          },
          data: content,
          bookCode,
          testament,
        });

        const bookName = ALL_BIBLE_BOOKS[bookId];
        const docs = [
          document({
            bookCode: bookId,
            bookName: bookName,
            testament: isNewTestament(bookId) ? 'nt' : 'ot',
          }),
        ];
        const languageName = language.name || language.languageId;
        const title = `${languageName} ${typeName} - ${bookName}`;
        const i18n = {
          ...i18n_default,
          titlePage: title,
          title,
        };
        setI18n(i18n);
        setDocuments(docs);
      }
    }

    doSubmitPreview();
  }, [ submitPreview, usfm, bookId, language.name, language.languageId, typeName, languageId ]);

  let message;

  if (errors?.length) {
    message = 'Error rendering';
  } else if (html) {
    message = 'Rendering Complete.';
  } else {
    message = `Progress: ${progress}`;
  }

  return (
    <div>
      {message}
    </div>
  );
}

export default PreviewContent;
