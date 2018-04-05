import React from 'react';
import ReactDOMServer from 'react-dom/server';
import ReactTooltip from 'react-tooltip';
import SVGInline from 'react-svg-inline';
import { Glyphicon } from 'react-bootstrap';
import fs from 'fs-extra';
import path from 'path-extra';
import * as style from '../components/groupMenu/Style';

const SVG_ICONS = ['invalidated'];

export function getGlyphIcons(glyphs) {
  const glyphicons = [];
  if (glyphs && glyphs.length) {
    glyphs.forEach((glyph)=>{
      if (SVG_ICONS.indexOf(glyph) >= 0) {
        const svgPath = path.join(__dirname, '..', '..', 'images', glyph+'.svg');
        const svg = fs.readFileSync(svgPath, 'utf8');
        if (svg)
          glyphicons.push(<SVGInline className={"glyphicon glyphicon-"+glyph} svg={svg} style={style.menuItem.statusIcon.invalidated} />);
      } else {
        glyphicons.push(<Glyphicon key={glyph} glyph={glyph} style={style.menuItem.statusIcon[glyph]} />);
      }
    });
  } else {
    glyphicons.push(<Glyphicon glyph="" style={style.menuItem.statusIcon.blank} />);
  }
  return glyphicons;
}

export function getStatusBadge(glyphs) {
  const statusGlyphs = getGlyphIcons(glyphs);
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
