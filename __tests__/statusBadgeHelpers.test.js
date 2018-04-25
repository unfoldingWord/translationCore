/* eslint-env jest */
import { mount } from 'enzyme';
import toJson from 'enzyme-to-json';
//helpers
import * as statusBadgeHelpers from '../src/js/helpers/statusBadgeHelpers';

describe('Tests statusBadgeHelpers.getGlyphIcons()', () => {
  test('test with no parameters passed', () => {
    // given
    const expectedGlyphCount = 1;

    // when
    const glyphIcons = statusBadgeHelpers.getGlyphIcons();

    // then
    expect(glyphIcons.length).toEqual(expectedGlyphCount);
    expect(glyphIcons).toMatchSnapshot();
  });

  test('test with glphys = null', () => {
    // given
    const glyphs = null;
    const expectedGlyphCount = 1;

    // when
    const glyphIcons = statusBadgeHelpers.getGlyphIcons(glyphs);

    // then
    expect(glyphIcons.length).toEqual(expectedGlyphCount);
    expect(glyphIcons).toMatchSnapshot();
  });

  test('test with one glphy', () => {
    // given
    const glyphs = ['pencil'];
    const expectedGlyphCount = 1;

    // when
    const glyphIcons = statusBadgeHelpers.getGlyphIcons(glyphs);

    // then
    expect(glyphIcons.length).toEqual(expectedGlyphCount);
    expect(glyphIcons).toMatchSnapshot();
  });

  test('test with an unstyled glphy', () => {
    // given
    const glyphs = ['unstyled'];
    const expectedGlyphCount = 1;

    // when
    const glyphIcons = statusBadgeHelpers.getGlyphIcons(glyphs);

    // then
    expect(glyphIcons.length).toEqual(expectedGlyphCount);
    expect(glyphIcons).toMatchSnapshot();
  });

  test('test with all status badge glphys', () => {
    // given
    const glyphs = ['invalidatefd', 'bookmark', 'ok', 'pencil', 'comment'];
    const expectedGlyphCount = glyphs.length;

    // when
    const glyphIcons = statusBadgeHelpers.getGlyphIcons(glyphs);

    // then
    expect(glyphIcons.length).toEqual(expectedGlyphCount);
    expect(glyphIcons).toMatchSnapshot();
  });
});

describe('Tests statusBadgeHelpers.getStatusBadge()', () => {
  test('test with no parameters passed', () => {
    // given
    const expectedGlyphCount = 1;

    // when
    const statusBadge = statusBadgeHelpers.getStatusBadge();
    const wrapper = mount(statusBadge);

    // then
    expect(wrapper.find('.glyphicon').length).toEqual(expectedGlyphCount);
    expect(wrapper.find('.glyphicon-blank').length).toEqual(expectedGlyphCount);
    expect(wrapper.find('.badge').length).toEqual(0);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('test with glphys = null', () => {
    // given
    const glyphs = null;
    const expectedGlyphCount = 1;

    // when
    const statusBadge = statusBadgeHelpers.getStatusBadge(glyphs);
    const wrapper = mount(statusBadge);

    // then
    expect(wrapper.find('.glyphicon').length).toEqual(expectedGlyphCount);
    expect(wrapper.find('.glyphicon-blank').length).toEqual(expectedGlyphCount);
    expect(wrapper.find('.badge').length).toEqual(0);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('test with one glphy', () => {
    // given
    const glyphs = ['pencil'];
    const expectedGlyphCount = 1;

    // when
    const statusBadge = statusBadgeHelpers.getStatusBadge(glyphs);
    const wrapper = mount(statusBadge);

    // then
    expect(wrapper.find('.glyphicon').length).toEqual(expectedGlyphCount);
    expect(wrapper.find('.glyphicon-pencil').length).toEqual(expectedGlyphCount);
    expect(wrapper.find('.badge').length).toEqual(0);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('test with an unstyled glphy', () => {
    // given
    const glyphs = ['unstyled'];
    const expectedGlyphCount = 1;

    // when
    const statusBadge = statusBadgeHelpers.getStatusBadge(glyphs);
    const wrapper = mount(statusBadge);

    // then
    expect(wrapper.find('.glyphicon').length).toEqual(expectedGlyphCount);
    expect(wrapper.find('.glyphicon-unstyled').length).toEqual(expectedGlyphCount);
    expect(wrapper.find('.badge').length).toEqual(0);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test('test with all status badge glphys', () => {
    // given
    const glyphs = ['invalidated', 'bookmark', 'ok', 'pencil', 'comment'];
    const expectedGlyphCount = glyphs.length;

    // when
    const statusBadge = statusBadgeHelpers.getStatusBadge(glyphs);
    const wrapper = mount(statusBadge);

    // then
    expect(wrapper.find('.glyphicon').length).toEqual(1);
    expect(wrapper.find('.glyphicon-invalidated').length).toEqual(1);
    expect(wrapper.find('.badge').text()).toEqual(String(expectedGlyphCount));
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
