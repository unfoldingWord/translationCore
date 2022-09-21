import { findBestMatchesForTargetText } from '../alignmentSearchHelpers';

describe('test findBestMatchesForTargetText', () => {
  it('test discontiguous jdg 13:23', () => {
    // given
    const expectedPos = [ 207, 213, 216, 225, 233, 236, 239 ];
    const targetText = 'would he have allowed us to hear';
    const verseText = 'But his wife replied to him, “If Yahweh had desired to kill us, he would not have taken from our hand the whole burnt offering and the offering. He would not have shown us all these things, and at this time would he have not allowed us to hear about this.”';

    // when
    const { targetPos } = findBestMatchesForTargetText(targetText, verseText);

    // then
    expect(targetPos).toEqual(expectedPos);
  });

  it('test discontiguous with quotes jdg 13:23', () => {
    // given
    const expectedPos = [30, 33, 239, 244 ];
    const targetText = 'If Yahweh hear about this';
    const verseText = 'But his wife replied to him, “If Yahweh had desired to kill us, he would not have taken from our hand the whole burnt offering and the offering. He would not have shown us all these things, and at this time would he have not allowed us to hear about this”';

    // when
    const { targetPos } = findBestMatchesForTargetText(targetText, verseText);

    // then
    expect(targetPos).toEqual(expectedPos);
  });

  it('test discontiguous with exclamation 1sa 13:3', () => {
    // given
    const expectedPos = [ 155, 171 ];
    const targetText = 'Let hear';
    const verseText = 'And Jonathan struck down the garrison of the Philistines that was at Geba and the Philistines heard. And Saul blew with the horn in all the land, saying, “Let the Hebrews hear!”';

    // when
    const { targetPos } = findBestMatchesForTargetText(targetText, verseText);

    // then
    expect(targetPos).toEqual(expectedPos);
  });

  it('test discontiguous with {} gen 41:15', () => {
    // given
    const expectedPos = [ 111, 117, 121 ];
    const targetText = 'that you hear';
    const verseText = 'Then Pharaoh said to Joseph, "I dreamed a dream, but no one could interpret it. But I heard about you, saying {that} you hear a dream {and are able} to interpret it.”';

    // when
    const { targetPos } = findBestMatchesForTargetText(targetText, verseText);

    // then
    expect(targetPos).toEqual(expectedPos);
  });

  it('test discontiguous with ? jdg 5:16', () => {
    // given
    const expectedPos = [ 54, 64, 68 ];
    const targetText = 'signaling for flocks';
    const verseText = 'Why did you sit among the campfires,\n' +
      'in order to hear signaling for flocks?\n' +
      'As for the divisions of Reuben\n' +
      'there were great resolutions of heart.';

    // when
    const { targetPos } = findBestMatchesForTargetText(targetText, verseText);

    // then
    expect(targetPos).toEqual(expectedPos);
  });

  it('test discontiguous with period jdg 5:16', () => {
    // given
    const expectedPos = [ 124, 136, 139 ];
    const targetText = 'resolutions of heart';
    const verseText = 'Why did you sit among the campfires,\n' +
      'in order to hear signaling for flocks?\n' +
      'As for the divisions of Reuben\n' +
      'there were great resolutions of heart.';

    // when
    const { targetPos } = findBestMatchesForTargetText(targetText, verseText);

    // then
    expect(targetPos).toEqual(expectedPos);
  });

  it('test discontiguous with comma jdg 5:16', () => {
    // given
    const expectedPos = [ 16, 22, 26 ];
    const targetText = 'among the campfires';
    const verseText = 'Why did you sit among the campfires,\n' +
      'in order to hear signaling for flocks?\n' +
      'As for the divisions of Reuben\n' +
      'there were great resolutions of heart.';

    // when
    const { targetPos } = findBestMatchesForTargetText(targetText, verseText);

    // then
    expect(targetPos).toEqual(expectedPos);
  });

  it('test discontiguous with new line jdg 5:16', () => {
    // given
    const expectedPos = [ 87, 97, 100 ];
    const targetText = 'divisions of Reuben';
    const verseText = 'Why did you sit among the campfires,\n' +
      'in order to hear signaling for flocks?\n' +
      'As for the divisions of Reuben\n' +
      'there were great resolutions of heart.';

    // when
    const { targetPos } = findBestMatchesForTargetText(targetText, verseText);

    // then
    expect(targetPos).toEqual(expectedPos);
  });

  it('test discontiguous with ‘ mrk 12:29', () => {
    // given
    const expectedPos = [ 87, 97, 100 ];
    const targetText = 'Hear O Israel';
    const verseText = 'Jesus answered, “The first is, ‘Hear, O Israel, the Lord our God, the Lord is one.';

    // when
    const { targetPos } = findBestMatchesForTargetText(targetText, verseText);

    // then
    expect(targetPos).toEqual(expectedPos);
  });
});

