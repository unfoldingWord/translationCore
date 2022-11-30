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
import { TextField } from 'material-ui';
import { getLanguageByCode } from '../helpers/LanguageHelpers';
import { isNewTestament } from '../helpers/bibleHelpers';
import { ALL_BIBLE_BOOKS } from '../common/BooksOfTheBible';
import { ASSETS_PATH, isProduction } from '../common/constants';
// import { JS_DIR } from '../common/constants';

const baseSizePx = 10; // use this as base font size for now, default was 7
const minFontSize = 5;

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

/**
 * insert new string between startPos and endPos in initialStr
 * @param {string} initialStr
 * @param {number} startPos
 * @param {number} endPos
 * @param {string}insertStr
 * @returns {string}
 */
function insertStr(initialStr, startPos, endPos, insertStr) {
  const beginPart = initialStr.substring(0, startPos);
  const endPart = initialStr.substring(endPos);
  const finalStr = beginPart + insertStr + endPart;
  return finalStr;
}

/**
 * replace variables in template marked by start and end, and scale the number there by factor
 * @param {string} template
 * @param {string} start - e.g. '%FS'
 * @param {string} end - e.g. '%'
 * @param {number} factor - value to multiply the enclosed number by
 * @param {number} fractionDigits - number of fractional digits to output
 * @param {string} units - optional units to append to new value
 * @returns {*}
 */
function scaleVariablesInTemplate(template, start, end, factor, fractionDigits, units ='') {
  let pos = 0;

  while (pos >= 0) {
    pos = template.indexOf(start, pos);

    if (pos >= 0) {
      const endNum = template.indexOf(end, pos + start.length);
      const originalStr = template.substring(pos + start.length, endNum);

      if (originalStr.length > 6) {
        console.warn(`scaleVariablesInTemplate(${start}) - value too long: ${originalStr}`);
      }

      let originalValue = parseFloat(originalStr);

      if (originalValue <= 0) {
        originalValue = 0;
      }

      const newSize = originalValue * factor;
      const newSizeStr = newSize.toFixed(fractionDigits);
      const newTemplate = insertStr(template, pos, endNum + end.length, newSizeStr + units);
      template = newTemplate;
    }
  }
  return template;
}

/**
 * replace font sizes in template in format `%FS7%`
 * @param {string} previewStyleTemplate
 * @param {number} factor - factor to multiply font size by
 * @returns {string}
 */
function replaceFontSizes(previewStyleTemplate, factor) {
  let template = previewStyleTemplate;
  const startStr = '%FS';
  const units = '';
  const fractionDigits = 1;
  const endStr = '%';
  template = scaleVariablesInTemplate(template, startStr, endStr, factor, fractionDigits, units);

  return template;
}

/**
 * replace page sizes in template in format `%PS18%`
 * @param {string} previewStyleTemplate
 * @param {number} factor - factor to multiply size by
 * @returns {string}
 */
function replacePageSizes(previewStyleTemplate, factor) {
  let template = previewStyleTemplate;
  const startStr = '%PS';
  const units = '';
  const fractionDigits = 0;
  const endStr = '%';
  template = scaleVariablesInTemplate(template, startStr, endStr, factor, fractionDigits, units);

  return template;
}

/**
 * replace pixel sizes in template in format `%PX6%`
 * @param {string} previewStyleTemplate
 * @param {number} factor - factor to multiply size by
 * @returns {string}
 */
function replacePixelSizes(previewStyleTemplate, factor) {
  let template = previewStyleTemplate;
  const startStr = '%PX';
  const units = '';
  const fractionDigits = 1;
  const endStr = '%';
  template = scaleVariablesInTemplate(template, startStr, endStr, factor, fractionDigits, units);

  return template;
}

/**
 * adjust the HTML for tCore preview
 * @param {string} html - initial html
 * @param {string} projectFont
 * @param {number} baseSizePx
 * @param {number} scale - scale to apply to everything
 * @returns {string} - returns new html
 */
function convertPrintPreviewHtml(html, projectFont, baseSizePx, scale=1) {
  let publicBase;

  if (isProduction) {
    publicBase = path.join(__dirname);
  } else { // running in development
    // --dirname in development is in ./node_modules/electronite/dist/Electron.app/Contents/Resources/electron.asar/renderer
    publicBase = path.join(__dirname, '../../../../../../../../public');
  }

  let html_ = html;
  const pagedPath = path.join(publicBase, './js/paged.polyfill.js');
  let previewStyleTemplate = fs.readFileSync(path.join(ASSETS_PATH, 'previewTemplate.css'), 'utf8');
  previewStyleTemplate = replaceFontSizes(previewStyleTemplate, baseSizePx*scale/7);
  previewStyleTemplate = replacePageSizes(previewStyleTemplate, scale);
  previewStyleTemplate = replacePixelSizes(previewStyleTemplate, scale);
  const startStyleStr = '<style>';
  const startStylePos = html.indexOf(startStyleStr);
  const endStyleStr = '</style>';
  const endStylePos = html.indexOf(endStyleStr, startStylePos);

  if ((startStylePos >= 0) && (endStylePos >= 0)) {
    html_ = insertStr(html_, startStylePos + startStyleStr.length, endStylePos, '\n' + previewStyleTemplate + '\n');
  }

  try {
    let headerPrefix = '';

    if (!projectFont) {
      projectFont = 'default';
    }

    const styleName = `previewStyles-${projectFont}.css`;
    const cssPath = path.join(publicBase, styleName);
    const cssLink = `<link rel="stylesheet" type="text/css" href="file://${cssPath}">\n`;
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
  const [fontSize, setFontSize] = useState(baseSizePx);
  const [scale, setScale] = useState(1);
  const [tempFontSize, setTempFontSize] = useState(baseSizePx);

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
      const html_ = convertPrintPreviewHtml(html, projectFont, fontSize);
      onRefresh && onRefresh(html_);
      setSubmitPreview(false);
    }
  }, [html, submitPreview, running, projectFont, onRefresh, fontSize]);

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
        console.log(`PreviewContent() - printing direction for ${languageId} is ${textDirection}`);
        setDocuments(docs);
      }
    }

    doSubmitPreview();
  }, [ submitPreview, usfm, bookId, language.name, language.languageId, typeName, languageId, textDirection ]);

  let message;

  function updatePreview(text) {
    let fontSize = parseFloat(tempFontSize || '');
    let scale_ = parseFloat(scale || '');

    if (fontSize >= minFontSize) {
      console.log(`updateFont() - using size ${fontSize} from ${tempFontSize}`);
    } else {
      console.log(`updateFont() - error size ${fontSize} from ${tempFontSize} is less than ${minFontSize}, limiting`);
      fontSize = minFontSize;
    }
    setFontSize(fontSize);

    if (scale_ < 0.1) {
      console.log(`updateFont() - scale ${scale_} is too low`);
      scale_ = 0.1;
    } else if (scale_ > 15) {
      console.log(`updateFont() - scale ${scale_} is too high`);
      scale_ = 15;
    }
    console.log(`updateFont() - using scale ${scale_} from ${scale}`);
    setScale(scale_ + '');

    if (onRefresh) {
      const html_ = convertPrintPreviewHtml(html, projectFont, fontSize, scale_);
      onRefresh && onRefresh(html_);
    }
  }

  if (errors?.length) {
    message = 'Error rendering';
  } else if (html) {
    message = <div>
      <div>
        {'Change Preview Font Size: '}
        <TextField
          id={'font_size'}
          defaultValue={`${fontSize}`}
          style={{
            width: '40px',
            marginLeft: '20px',
            marginRight: '20px',
          }}
          onChange={e => setTempFontSize(e.target.value)}
        />
      </div>
      <br/>
      <div>
        {'Change Preview Scale: '}
        <TextField
          id={'font_size'}
          defaultValue={`${scale}`}
          style={{
            width: '40px',
            marginLeft: '20px',
            marginRight: '20px',
          }}
          onChange={e => setScale(e.target.value)}
        />
      </div>
      <br/>
      <button className='btn-prime' onClick={updatePreview} >
        {'Update Preview'}
      </button>
    </div>;
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
