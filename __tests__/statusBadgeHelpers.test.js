/* eslint-env jest */

//helpers
import * as statusBadgeHelpers from '../src/js/helpers/statusBadgeHelpers';

describe('Tests statusBadgeHelpers.getGlyphIcons()', () => {
  test('test with no parameters passed', () => {
    // when
    const glyphIcons = statusBadgeHelpers.getGlyphIcons();

    // then
    expect(glyphIcons).toMatchSnapshot();
  });

  test('test with glphys = null', () => {
    // given
    const glyphs = null;

    // when
    const glyphIcons = statusBadgeHelpers.getGlyphIcons(glyphs);

    // then
    expect(glyphIcons).toMatchSnapshot();
  });

  test('test with one glphy', () => {
    // given
    const glyphs = ['pencil'];

    // when
    const glyphIcons = statusBadgeHelpers.getGlyphIcons(glyphs);

    // then
    expect(glyphIcons).toMatchSnapshot();
  });

  test('test with an unstyled glphy', () => {
    // given
    const glyphs = ['unstyled'];

    // when
    const glyphIcons = statusBadgeHelpers.getGlyphIcons(glyphs);

    // then
    expect(glyphIcons).toMatchSnapshot();
  });

  test('test with all status badge glphys', () => {
    // given
    const glyphs = ['invalidated', 'bookmark', 'ok', 'pencil', 'comment'];

    // when
    const glyphIcons = statusBadgeHelpers.getGlyphIcons(glyphs);

    // then
    expect(glyphIcons).toMatchSnapshot();
  });
});

describe('Tests statusBadgeHelpers.getStatusBadge()', () => {
  test('test with no parameters passed', () => {
    // when
    const statusBadge = statusBadgeHelpers.getStatusBadge();

    // then
    expect(statusBadge).toMatchSnapshot();
  });

  test('test with glphys = null', () => {
    // given
    const glyphs = null;

    // when
    const statusBadge = statusBadgeHelpers.getStatusBadge(glyphs);

    // then
    expect(statusBadge).toMatchSnapshot();
  });

  test('test with one glphy', () => {
    // given
    const glyphs = ['pencil'];

    // when
    const statusBadge = statusBadgeHelpers.getStatusBadge(glyphs);

    // then
    expect(statusBadge).toMatchSnapshot();
  });

  test('test with an unstyled glphy', () => {
    // given
    const glyphs = ['unstyled'];

    // when
    const statusBadge = statusBadgeHelpers.getStatusBadge(glyphs);

    // then
    expect(statusBadge).toMatchSnapshot();
  });

  test('test with all status badge glphys', () => {
    // given
    const glyphs = ['invalidated', 'bookmark', 'ok', 'pencil', 'comment'];

    // when
    const statusBadge = statusBadgeHelpers.getStatusBadge(glyphs);

    // then
    expect(statusBadge).toMatchSnapshot();
  });
});
