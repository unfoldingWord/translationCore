import React from 'react';
import ReactDOMServer from 'react-dom/server';
import ReactTooltip from 'react-tooltip';
import { Glyphicon } from 'react-bootstrap';
import * as style from '../components/groupMenu/Style';

export function getGlyphicons(glyphs) {
  const glyphicons = [];
  if (glyphs && glyphs.length) {
    glyphs.forEach((glyph)=>{
      glyphicons.push(<Glyphicon key={glyph} glyph={glyph} style={style.menuItem.statusIcon[glyph]} />);
    });
  } else {
    glyphicons.push(<Glyphicon glyph="" style={style.menuItem.statusIcon.blank} />);
  }
  return glyphicons;  
}

export function getStatusBadge(glyphs) {
  const statusGlyphs = getGlyphicons(glyphs);
  const statusCount = statusGlyphs.length;
  const mainGlyph = statusGlyphs.shift();
  if (statusCount > 1) {
    const tooltip = ReactDOMServer.renderToString(statusGlyphs);
    return (
      <div className="status-badge-wrapper">
        <div
          className="status-badge"
          data-tip={tooltip}
          data-html="true"
          data-place="bottom"
          data-effect="float"
          data-class="status-tooltip"
          data-delay-hide="100"
          data-offset="{'bottom': -5, 'right': 5}" >
          {mainGlyph}
          <div className="badge">
              {statusCount}
          </div>
        </div>
        <ReactTooltip />
      </div>
    );
  } else {
    return (
      <div className="status-badge">
        {mainGlyph}
      </div>
    );
  }  
}
